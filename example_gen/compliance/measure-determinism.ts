// Determinism measurement: runs the LLM evaluators against a fixture N times
// (default 3) with cache + cassette disabled, then reports per-rule flips.
// Use to calibrate which rules are stable enough for blocking-mode merge gate.
//
// Usage:
//   OPENAI_API_KEY=sk-... npx tsx example_gen/compliance/measure-determinism.ts \
//     --file tests/compliance/fixtures/passing/slides/abcam-kickoff.html \
//     --runs 3 \
//     --budget 5
//
// Output: a table of `ruleId | answers | flipped?` and a summary count of
// flipped rules. Any flipped rule should be (a) demoted to advisory, or
// (b) gated behind majority-vote, before flipping the global blocking mode.

import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadRules } from "./load-rules.js";
import { classifyArtifact, applicableRules } from "./classify.js";
import { runVisual } from "./evaluator-visual.js";
import { runProse } from "./evaluator-prose.js";
import { CostTracker } from "./cost-tracker.js";
import { Cache } from "./cache.js";
import { Cassette } from "./cassette.js";
import { OpenAIClient } from "./openai-client.js";
import type { Finding } from "./types.js";

interface Args { file: string; runs: number; budgetUsd: number; repoRoot: string; }

function parseArgs(): Args {
  const a = process.argv.slice(2);
  const get = (k: string, d?: string): string => {
    const i = a.indexOf(k);
    if (i < 0 || !a[i + 1]) {
      if (d !== undefined) return d;
      throw new Error(`missing required flag ${k}`);
    }
    return a[i + 1]!;
  };
  return {
    file: get("--file"),
    runs: parseInt(get("--runs", "3"), 10),
    budgetUsd: parseFloat(get("--budget", "5")),
    repoRoot: get("--repo-root", process.cwd()),
  };
}

async function main() {
  const opts = parseArgs();
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY required for live determinism measurement.");
    process.exit(2);
  }
  const rules = loadRules(path.join(opts.repoRoot, "rules/visual-rules.yml"));
  const html = readFileSync(opts.file, "utf8");
  const artifact = classifyArtifact(opts.file, html);
  const applicable = applicableRules(rules, artifact);

  // Per-run scratch dirs so cache + cassette never short-circuit a live call.
  const answersByRule: Map<string, string[]> = new Map();
  for (let i = 0; i < opts.runs; i++) {
    const scratch = mkdtempSync(path.join(tmpdir(), `compliance-determinism-${i}-`));
    const cache = new Cache(path.join(scratch, "cache"));
    const cassette = new Cassette(path.join(scratch, "cassette"), false);
    const cost = new CostTracker(opts.budgetUsd);
    const client = new OpenAIClient(cache, cassette, cost);
    try {
      const findings: Finding[] = [
        ...(await runVisual(artifact, applicable, client)),
        ...(await runProse(artifact, applicable, opts.repoRoot, client)),
      ];
      for (const f of findings) {
        const key = f.ruleId;
        const ans = f.status === "fail" ? "FAIL"
          : f.status === "pass" ? "PASS"
          : f.status === "n/a" ? "n/a"
          : `skip(${f.skipReason ?? "?"})`;
        const list = answersByRule.get(key) ?? [];
        list.push(ans);
        answersByRule.set(key, list);
      }
      console.error(`[run ${i + 1}/${opts.runs}] cost=$${cost.spent().toFixed(2)} (cumulative across runs)`);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  }

  let flipped = 0;
  console.log(`\nrule_id\tanswers\tflipped`);
  for (const [ruleId, answers] of [...answersByRule.entries()].sort()) {
    const set = new Set(answers);
    const isFlipped = set.size > 1;
    if (isFlipped) flipped++;
    console.log(`${ruleId}\t${answers.join(",")}\t${isFlipped ? "FLIPPED" : ""}`);
  }
  console.log(`\n${flipped} of ${answersByRule.size} rules flipped across ${opts.runs} runs.`);
  if (flipped > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(2); });
