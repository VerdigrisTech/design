import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import path from "node:path";
import fg from "fast-glob";
import { run } from "./runner.js";
import { writeReports, renderMarkdown } from "./reporter.js";

async function main() {
  const args = process.argv.slice(2);
  const noLlm = args.includes("--no-llm");
  const smoke = args.includes("--smoke");
  const baseline = args.includes("--baseline");
  // Strict positive-number validation. `Number("")` and `Number("abc")` both
  // fail isFinite + > 0, so empty / malformed inputs are rejected loudly
  // instead of silently disabling the gate (Number("") === 0; Number("abc")
  // === NaN; both are unsafe defaults).
  const isValidBudget = (n: number): boolean => Number.isFinite(n) && n > 0;

  const budgetFlag = args.find((a) => a.startsWith("--budget="));
  const budgetCliRaw = budgetFlag ? budgetFlag.split("=")[1] ?? "" : "";
  const budgetCli = budgetCliRaw === "" ? NaN : Number(budgetCliRaw);
  if (budgetFlag && !isValidBudget(budgetCli)) {
    console.error(`compliance-audit: --budget must be a positive number; got "${budgetCliRaw}".`);
    process.exit(2);
  }

  const ciBudgetRaw = process.env.COMPLIANCE_AUDIT_BUDGET_USD ?? "40";
  const ciBudget = Number(ciBudgetRaw);
  if (!isValidBudget(ciBudget)) {
    console.error(`compliance-audit: COMPLIANCE_AUDIT_BUDGET_USD must be a positive number; got "${ciBudgetRaw}".`);
    process.exit(2);
  }

  const isCI = process.env.CI === "true";
  if (isCI && isValidBudget(budgetCli)) {
    console.warn("compliance-audit: --budget flag ignored in CI; using COMPLIANCE_AUDIT_BUDGET_USD.");
  }
  const budgetUsd = isCI
    ? ciBudget
    : isValidBudget(budgetCli)
      ? budgetCli
      : ciBudget;

  const positional = args.filter((a) => !a.startsWith("--"));
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

  let files: string[];
  if (smoke) {
    files = await fg("tests/compliance/fixtures/passing/slides/*.html", { cwd: repoRoot, absolute: true });
    if (files.length === 0) throw new Error("smoke fixture missing");
    files = files.slice(0, 1);
  } else if (positional.length > 0) {
    files = (await fg(positional, { cwd: repoRoot, absolute: true })).filter((f) => f.endsWith(".html"));
  } else {
    files = await fg(["categories/{slides,one-pagers}/examples/*.html"], { cwd: repoRoot, absolute: true });
  }
  if (files.length === 0) {
    console.log("compliance-audit: no in-scope files; exiting.");
    return;
  }

  const summary = await run({ repoRoot, files, budgetUsd, noLlm });
  const sha = (() => {
    try {
      return execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim();
    } catch {
      return "0000000";
    }
  })();
  const { md, json } = writeReports(repoRoot, summary, sha);
  console.log(renderMarkdown(summary));
  console.log(`\nReport: ${md}\n        ${json}`);

  if (baseline) {
    console.log("(baseline mode: not exiting non-zero)");
    return;
  }
  if (summary.blockingMode === "blocking" && summary.blockingCount > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
