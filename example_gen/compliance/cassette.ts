import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Cache } from "./cache.js";

export interface CassetteEntry {
  request: unknown;
  response: unknown;
}

export class Cassette {
  constructor(private readonly dir: string, private readonly recording: boolean) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
  key(request: unknown): string { return Cache.keyOf(request); }
  has(key: string): boolean { return existsSync(path.join(this.dir, `${key}.json`)); }
  read(key: string): CassetteEntry {
    return JSON.parse(readFileSync(path.join(this.dir, `${key}.json`), "utf8"));
  }
  write(key: string, entry: CassetteEntry): void {
    writeFileSync(path.join(this.dir, `${key}.json`), JSON.stringify(entry, null, 2));
  }
  isRecording(): boolean { return this.recording; }
}

export function defaultCassette(testCassetteDir: string): Cassette {
  return new Cassette(testCassetteDir, process.env.OPENAI_RECORD === "1");
}
