import { readFileSync } from "node:fs";
import path from "node:path";
import { loadRules } from "./load-rules.js";
import { classifyArtifact, applicableRules } from "./classify.js";
import { parseSuppressions } from "./suppression.js";
import { runDeterministic } from "./evaluator-deterministic.js";
import { runVisual } from "./evaluator-visual.js";
import { runProse } from "./evaluator-prose.js";
import { applySuppressions, synthesize } from "./synthesize.js";
import { CostTracker } from "./cost-tracker.js";
import { Cache } from "./cache.js";
import { Cassette } from "./cassette.js";
import { OpenAIClient } from "./openai-client.js";
import type { EvalResult, RunSummary, Finding } from "./types.js";

export interface RunOptions {
  repoRoot: string;
  files: string[];
  budgetUsd: number;
  noLlm: boolean;
  cassetteDir?: string;
}

export async function run(opts: RunOptions): Promise<RunSummary> {
  const rulesPath = path.join(opts.repoRoot, "rules/visual-rules.yml");
  const rules = loadRules(rulesPath);
  const cache = new Cache(path.join(opts.repoRoot, ".cache/compliance-audit"));
  const cassette = new Cassette(
    opts.cassetteDir ?? path.join(opts.repoRoot, "tests/compliance/cassettes"),
    process.env.OPENAI_RECORD === "1"
  );
  const cost = new CostTracker(opts.budgetUsd);
  const client = new OpenAIClient(cache, cassette, cost);

  const results: EvalResult[] = [];
  for (const file of opts.files) {
    const startedAt = new Date().toISOString();
    const costBefore = cost.spent();
    const html = readFileSync(file, "utf8");
    const artifact = classifyArtifact(file, html);
    const suppressions = parseSuppressions(file, html);
    const applicable = applicableRules(rules, artifact);
    const knownIds = new Set(applicable.map((r) => r.id));
    for (const s of suppressions) {
      if (!knownIds.has(s.ruleId)) {
        console.warn(`warn: ${file}: suppression for "${s.ruleId}" matches no applicable rule (typo or stale id?)`);
      }
    }

    let findings: Finding[] = [];
    findings.push(...runDeterministic(artifact, applicable));
    if (!opts.noLlm) {
      findings.push(...(await runVisual(artifact, applicable, client)));
      findings.push(...(await runProse(artifact, applicable, opts.repoRoot, client)));
    }
    findings = applySuppressions(findings, suppressions);
    results.push({
      artifact,
      findings,
      costUsd: cost.spent() - costBefore,
      startedAt,
      finishedAt: new Date().toISOString(),
    });
  }

  const all = results.flatMap((r) => r.findings);
  const syn = synthesize(all);
  const blockingMode: RunSummary["blockingMode"] =
    process.env.COMPLIANCE_AUDIT_BLOCKING === "false"
      ? "advisory-repo"
      : process.env.COMPLIANCE_AUDIT_PR_LABEL === "advisory"
        ? "advisory-pr"
        : "blocking";
  return {
    blockingCount: syn.blocking.length,
    advisoryCount: syn.advisory.length,
    skippedCount: syn.skipped.length,
    passedCount: syn.passed.length,
    naCount: syn.na.length,
    totalCostUsd: cost.spent(),
    budgetUsd: opts.budgetUsd,
    blockingMode,
    results,
  };
}
