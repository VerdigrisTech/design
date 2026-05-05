import { Cache } from "./cache.js";
import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "cache-"));
const c = new Cache(dir);
assert.equal(c.get("k1"), undefined);
c.set("k1", { foo: "bar" });
assert.deepEqual(c.get("k1"), { foo: "bar" });
rmSync(dir, { recursive: true });
console.log("PASS: cache");
