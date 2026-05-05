import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export class Cache {
  constructor(private readonly dir: string) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
  static keyOf(...parts: (string | object)[]): string {
    const h = createHash("sha256");
    for (const p of parts) h.update(typeof p === "string" ? p : JSON.stringify(p));
    return h.digest("hex");
  }
  private file(key: string): string { return path.join(this.dir, `${key}.json`); }
  get<T>(key: string): T | undefined {
    const f = this.file(key);
    if (!existsSync(f)) return undefined;
    return JSON.parse(readFileSync(f, "utf8")) as T;
  }
  set(key: string, value: unknown): void {
    writeFileSync(this.file(key), JSON.stringify(value));
  }
}
