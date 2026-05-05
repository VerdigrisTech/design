import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "./runner.js";
import { synthesize } from "./synthesize.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const expected = JSON.parse(readFileSync(path.join(repoRoot, "tests/compliance/fixtures/expected.json"), "utf8")) as Record<string, any>;

async function main() {
  let failed = 0;
  for (const [relPath, exp] of Object.entries(expected)) {
    const summary = await run({
      repoRoot,
      files: [path.join(repoRoot, relPath)],
      budgetUsd: 1,
      noLlm: true,                  // v0.1: deterministic-only self-test; cassettes not yet recorded
      cassetteDir: path.join(repoRoot, "tests/compliance/cassettes"),
    });
    const detBlocking = summary.results
      .flatMap((r) => synthesize(r.findings).blocking)
      .filter((f) => !f.llmAnswer).length;

    if ("deterministic_blocking" in exp) {
      if (detBlocking !== exp.deterministic_blocking) {
        console.error(`FAIL ${relPath}: expected exactly ${exp.deterministic_blocking} det blocking, got ${detBlocking}`);
        failed++; continue;
      }
    }
    if ("deterministic_blocking_min" in exp) {
      if (detBlocking < exp.deterministic_blocking_min) {
        console.error(`FAIL ${relPath}: expected ≥${exp.deterministic_blocking_min} det blocking, got ${detBlocking}`);
        failed++; continue;
      }
    }
    if ("deterministic_blocking_max" in exp) {
      if (detBlocking > exp.deterministic_blocking_max) {
        console.error(`FAIL ${relPath}: expected ≤${exp.deterministic_blocking_max} det blocking, got ${detBlocking}`);
        failed++; continue;
      }
    }
    console.log(`OK   ${relPath}: det blocking=${detBlocking}`);
  }
  if (failed > 0) {
    console.error(`\n${failed} fixture(s) failed`);
    process.exit(1);
  }
  console.log("\nAll fixtures passed.");
}
main().catch((e) => { console.error(e); process.exit(2); });
