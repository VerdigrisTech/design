import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

// Bump when the cache key formula or the entry shape changes so old entries
// don't get served as fresh hits. Entries written under one version are
// invisible to readers running another version.
const CACHE_NAMESPACE_VERSION = "v1";

function stableStringify(value: unknown): string {
  // JSON.stringify is order-sensitive on object keys, which makes the cache
  // hash silently change when an unrelated property-order refactor lands.
  // Walk the value, sorting object keys at every level, before stringifying.
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify((value as any)[k])}`)
    .join(",")}}`;
}

export class Cache {
  constructor(private readonly dir: string) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
  static keyOf(...parts: (string | object)[]): string {
    const h = createHash("sha256");
    h.update(CACHE_NAMESPACE_VERSION);
    for (const p of parts) h.update(typeof p === "string" ? p : stableStringify(p));
    return h.digest("hex");
  }
  private file(key: string): string { return path.join(this.dir, `${key}.json`); }
  get<T>(key: string): T | undefined {
    const f = this.file(key);
    if (!existsSync(f)) return undefined;
    try {
      return JSON.parse(readFileSync(f, "utf8")) as T;
    } catch {
      // Corrupt entry (likely a half-written file from a prior crash). Treat
      // as a miss; the caller will re-populate on the next live call.
      return undefined;
    }
  }
  set(key: string, value: unknown): void {
    // Atomic write: stage to .tmp then rename. A crash mid-write leaves the
    // .tmp orphan but never a partial .json that the next run would parse.
    const target = this.file(key);
    const tmp = `${target}.tmp`;
    writeFileSync(tmp, JSON.stringify(value));
    renameSync(tmp, target);
  }
}
