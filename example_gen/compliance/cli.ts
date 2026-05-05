import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import { run } from "./runner.js";
import { writeReports, renderMarkdown } from "./reporter.js";

const HELP = `compliance-audit -- per-artifact design-system compliance check

Usage:
  npm run audit:compliance [-- <flags>] [paths...]

Paths (optional):
  Positional paths or globs scoped to categories/{slides,one-pagers}/examples/.
  When omitted, audits every example in those directories.
  Explicit paths that don't exist are an error (typo guard); only globs may
  match zero files.

Flags:
  --no-llm              Skip visual + prose evaluators (deterministic only).
  --smoke               Audit a single passing fixture (CI smoke check).
                        Implies --no-llm and --baseline; smoke is a wiring
                        test, not a content/evaluator test.
  --baseline            Run as normal but always exit 0 (used for capturing
                        a day-one baseline of pre-existing failures).
  --budget=<usd>        Cost ceiling for live LLM calls. Default: 40 (or
                        $COMPLIANCE_AUDIT_BUDGET_USD if set). Ignored in CI;
                        CI uses the env var.
  --quiet               Don't dump the full markdown report to stdout; print
                        the headline summary only.
  -h, --help            Print this help and exit.

Environment:
  OPENAI_API_KEY                    Required for LLM evaluators. Without
                                    it the run is deterministic-only.
  COMPLIANCE_AUDIT_BUDGET_USD       CI budget cap (default 40).
  COMPLIANCE_AUDIT_BLOCKING         Anything other than "false" makes
                                    blocking findings, budget exhaustion,
                                    or refused invariant suppressions fail
                                    the build. Default blocking; CI sets
                                    "false" for advisory mode.
  COMPLIANCE_AUDIT_PR_LABEL         Set to "advisory" to mark a single PR
                                    as advisory even when blocking is on.
  COMPLIANCE_AUDIT_MODEL            Override the LLM model (default gpt-4o).
  COMPLIANCE_AUDIT_RETAIN           Number of audit reports to keep
                                    (default 20).

Exit codes:
  0    Audit completed; no blocking failures (advisory mode always exits 0).
  1    Blocking findings, budget exhausted, or invariant-bypass attempted
       (only in COMPLIANCE_AUDIT_BLOCKING=true mode).
  2    Bad CLI args, missing paths, or unrecoverable error in the auditor.
`;

// Allowed roots for positional paths/globs. A producer cannot accidentally
// (or deliberately) point the auditor at the whole repo via an `**/*` glob.
const ALLOWED_PATH_PREFIXES = [
  "categories/slides/examples/",
  "categories/one-pagers/examples/",
  "tests/compliance/fixtures/",
];

function isPathInScope(absRepoRoot: string, abs: string): boolean {
  const rel = path.relative(absRepoRoot, abs).replaceAll("\\", "/");
  return ALLOWED_PATH_PREFIXES.some((p) => rel.startsWith(p));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    process.stdout.write(HELP);
    return;
  }

  const smoke = args.includes("--smoke");
  // --smoke is a wiring test: does the auditor run end-to-end against a
  // known fixture? It is not an evaluator test, so:
  //   - imply --no-llm: there's no point burning $5+ of vision calls (or
  //     spinning up Playwright) when all we're checking is the runner.
  //   - imply --baseline: the "passing" fixture has expected non-zero
  //     deterministic blocking findings (8 today); under blocking mode
  //     the smoke would fail-exit-1 even when the auditor itself is fine.
  const noLlm = args.includes("--no-llm") || smoke;
  const baseline = args.includes("--baseline") || smoke;
  const quiet = args.includes("--quiet");

  // Strict positive-number validation. `Number("")` and `Number("abc")` both
  // fail isFinite + > 0, so empty / malformed inputs are rejected loudly
  // instead of silently disabling the gate.
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

  // Reject any unknown -- flag instead of silently passing it through. Catches
  // typos like `--no-llms` that would otherwise behave as the default.
  const knownFlags = new Set([
    "--no-llm", "--smoke", "--baseline", "--quiet", "--help", "-h",
  ]);
  for (const a of args) {
    if (a.startsWith("-") && !knownFlags.has(a) && !a.startsWith("--budget=")) {
      console.error(`compliance-audit: unknown flag "${a}". See --help.`);
      process.exit(2);
    }
  }

  const positional = args.filter((a) => !a.startsWith("-"));
  if (smoke && positional.length > 0) {
    console.error(`compliance-audit: --smoke takes no positional paths (got: ${positional.join(", ")}).`);
    process.exit(2);
  }
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

  let files: string[];
  if (smoke) {
    // Pin the smoke fixture by name. Without this, `fg(...).slice(0, 1)`
    // returned the alphabetically-first fixture; adding any new fixture
    // earlier in sort order would silently change what --smoke tests.
    const smokeFixture = path.join(repoRoot, "tests/compliance/fixtures/passing/slides/abcam-kickoff.html");
    if (!existsSync(smokeFixture)) {
      throw new Error(`smoke fixture missing at ${path.relative(repoRoot, smokeFixture).replaceAll("\\", "/")}`);
    }
    files = [smokeFixture];
  } else if (positional.length > 0) {
    // Distinguish literal paths from globs. A literal that doesn't exist is
    // a typo; fail loud. A glob that matches nothing is acceptable (the
    // user globbed and there are simply no matches today).
    const literals: string[] = [];
    const globs: string[] = [];
    for (const p of positional) {
      if (/[*?[\]{}]/.test(p)) globs.push(p);
      else literals.push(p);
    }
    const missing = literals.filter((p) => {
      const abs = path.isAbsolute(p) ? p : path.resolve(repoRoot, p);
      return !existsSync(abs) || !statSync(abs).isFile();
    });
    if (missing.length > 0) {
      console.error(`compliance-audit: path(s) not found:\n  ${missing.join("\n  ")}`);
      process.exit(2);
    }
    // Reject non-html or out-of-scope literals up front so the user sees a
    // clear error instead of a silent "no in-scope files; exiting" when they
    // typo a path or pass something that isn't an example artifact.
    const badLiterals = literals.filter((p) => {
      const abs = path.isAbsolute(p) ? p : path.resolve(repoRoot, p);
      return !p.endsWith(".html") || !isPathInScope(repoRoot, abs);
    });
    if (badLiterals.length > 0) {
      console.error(`compliance-audit: path(s) not in audit scope (must be .html under ${ALLOWED_PATH_PREFIXES.join(", ")}):`);
      for (const p of badLiterals) console.error(`  ${p}`);
      process.exit(2);
    }
    // Skip fast-glob for literal paths: fg interprets `[...]`, `{...}`, `*`
    // and `?` as glob syntax even in literal mode, so a real file like
    // `categories/slides/examples/[draft].html` would silently miss. Resolve
    // literals directly; only run fg over actual globs.
    const literalAbs = literals.map((p) => path.isAbsolute(p) ? p : path.resolve(repoRoot, p));
    const globMatches = globs.length > 0
      ? await fg(globs, { cwd: repoRoot, absolute: true })
      : [];
    files = [...literalAbs, ...globMatches].filter((f) => f.endsWith(".html"));
    // De-duplicate (a literal could also match a glob) so the same artifact
    // isn't audited twice.
    files = [...new Set(files)];
    // Constrain glob expansions to the allowed roots. Prevents a stray
    // `**/*.html` from scanning files outside the audit's scope. Literals
    // were already validated above.
    const outOfScope = files.filter((f) => !isPathInScope(repoRoot, f));
    if (outOfScope.length > 0) {
      console.error(`compliance-audit: paths outside the allowed roots (${ALLOWED_PATH_PREFIXES.join(", ")}):`);
      for (const f of outOfScope) console.error(`  ${path.relative(repoRoot, f)}`);
      process.exit(2);
    }
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
      // stderr is captured (pipe) so the catch handler can surface the
      // actual git error message instead of just the generic execSync throw.
      return execSync("git rev-parse HEAD", {
        cwd: repoRoot,
        timeout: 5_000,
        stdio: ["ignore", "pipe", "pipe"],
      }).toString().trim();
    } catch (e) {
      console.warn(`compliance-audit: could not resolve git SHA (${(e as Error).message}); using placeholder`);
      return "0000000";
    }
  })();
  const { md, json } = writeReports(repoRoot, summary, sha);
  if (quiet) {
    console.log(`compliance-audit: ${summary.results.length} artifacts | ${summary.blockingCount} blocking | ${summary.advisoryCount} advisory | $${summary.totalCostUsd.toFixed(2)} of $${summary.budgetUsd.toFixed(2)}${summary.budgetExhausted ? " (BUDGET EXHAUSTED)" : ""}`);
  } else {
    console.log(renderMarkdown(summary));
  }
  console.log(`\nReport: ${md}\n        ${json}`);

  if (baseline) {
    console.log("(baseline mode: not exiting non-zero)");
    return;
  }
  // Fail-closed in blocking mode for any of: real blocking findings, partial
  // audit due to budget exhaustion, or attempted bypass of an invariant rule.
  // The latter two were silent green pre-fix.
  if (summary.blockingMode === "blocking") {
    const reasons: string[] = [];
    if (summary.blockingCount > 0) reasons.push(`${summary.blockingCount} blocking findings`);
    if (summary.budgetExhausted) reasons.push("budget exhausted (audit incomplete)");
    if (summary.refusedSuppressionCount > 0) reasons.push(`${summary.refusedSuppressionCount} attempted invariant-bypass suppressions`);
    if (reasons.length > 0) {
      console.error(`compliance-audit: failing under COMPLIANCE_AUDIT_BLOCKING=true -- ${reasons.join("; ")}`);
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
