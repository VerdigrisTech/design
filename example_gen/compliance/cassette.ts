import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import path from "node:path";
import { Cache } from "./cache.js";

export interface CassetteEntry {
  request: unknown;
  response: unknown;
}

export class CassetteMismatchError extends Error {}

export class Cassette {
  constructor(private readonly dir: string, private readonly recording: boolean) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
  // Cassette key now mirrors the openai-client cache-key contract: it must
  // include the model. Callers pass ({ model, req }) and we hash the pair.
  key(model: string, request: unknown): string { return Cache.keyOf({ model, req: request }); }
  has(key: string): boolean { return existsSync(path.join(this.dir, `${key}.json`)); }
  read(key: string): CassetteEntry {
    return JSON.parse(readFileSync(path.join(this.dir, `${key}.json`), "utf8"));
  }
  // Defence-in-depth: even though `key` already encodes the request shape,
  // also confirm the persisted request matches the current request before
  // serving the response. Catches the case where someone bumps a prompt or
  // model without bumping CACHE_NAMESPACE_VERSION.
  assertRequestMatches(key: string, expectedRequest: unknown): void {
    const entry = this.read(key);
    const a = stableStringify(entry.request);
    const b = stableStringify(expectedRequest);
    if (a !== b) {
      throw new CassetteMismatchError(
        `cassette ${key}: persisted request differs from current request (rerun with OPENAI_RECORD=1 to refresh)`,
      );
    }
  }
  // Atomic write: stage to .tmp then rename. A crash mid-write must not
  // leave a half-baked cassette that ships in a PR.
  write(key: string, entry: CassetteEntry): void {
    const target = path.join(this.dir, `${key}.json`);
    const tmp = `${target}.tmp`;
    writeFileSync(tmp, JSON.stringify(entry, null, 2));
    renameSync(tmp, target);
  }
  isRecording(): boolean { return this.recording; }
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify((value as any)[k])}`).join(",")}}`;
}

export function defaultCassette(testCassetteDir: string): Cassette {
  return new Cassette(testCassetteDir, process.env.OPENAI_RECORD === "1");
}
