// example_gen/compliance/types.ts
export type Severity = "error" | "warning";
export type Maturity = "experimental" | "convention" | "rule" | "invariant";
export type EvaluatorClass = "deterministic" | "visual-llm" | "prose-llm";

export interface RuleTest {
  regex?: string;
  value?: string | number;
  values?: (string | number)[];
  min?: number;
  max?: number;
  pattern?: string;
  llm_eval?: string | { prompt: string; rubric?: unknown; aggregation?: string };
  input_scope?: string[];
}

export interface Rule {
  id: string;                    // dot-path, e.g. "color.contrast.normal-text"
  namespace: string;             // top-level segment of id
  description: string;
  severity: Severity;
  type: "value" | "pattern" | "constraint" | "reference";
  maturity: Maturity;            // resolved (defaults to "rule" if absent)
  modes?: string[];              // normalized to underscore form
  evaluator?: ("visual" | "prose")[]; // forward-compat override
  test: RuleTest;
  evaluatorClass: EvaluatorClass;
}

export interface Artifact {
  path: string;                  // absolute or repo-relative path
  type: "slides" | "one-pagers"; // derived from path
  genre: string;                 // normalized to underscore form
  confidentiality?: string;
  html: string;                  // raw file contents
}

export interface Suppression {
  ruleId: string;
  reason: string;
  linear: string;                // Z2O-NNN
  file: string;
  line: number;
}

export type FindingStatus =
  | "fail"      // rule fired
  | "pass"      // rule evaluated cleanly
  | "skipped"   // not run (budget, render error, llm error)
  | "suppressed"// fail downgraded to suppressed
  | "n/a";      // not applicable (e.g. prose rule but artifact has no text)

export interface Finding {
  ruleId: string;
  artifactPath: string;
  status: FindingStatus;
  severity: Severity;
  maturity: Maturity;
  message?: string;              // populated on fail
  llmAnswer?: string;            // verbatim model response on llm_eval rules
  skipReason?: "budget" | "render" | "llm-error" | "render-failure" | "config-error";
  suppression?: Suppression;
  costUsd?: number;              // share of batch cost attributed to this rule
}

export interface EvalResult {
  artifact: Artifact;
  findings: Finding[];
  // Per-artifact LLM spend (delta of CostTracker.spent() across this run).
  // Distinct from RunSummary.totalCostUsd, which is the cumulative total.
  costUsd: number;
  startedAt: string;             // ISO
  finishedAt: string;
}

export interface SuppressionRecord {
  ruleId: string;
  artifactPath: string;
  linear: string;
  reason: string;
  line: number;
  // status="applied" -> the suppression downgraded a fail to suppressed.
  // status="refused-invariant" -> the suppression matched but was rejected
  //   because invariant rules cannot be overridden.
  // status="no-match" -> the suppression matched no failing finding.
  status: "applied" | "refused-invariant" | "no-match";
}

export interface RunSummary {
  blockingCount: number;
  advisoryCount: number;
  skippedCount: number;
  passedCount: number;
  naCount: number;
  suppressedCount: number;          // count of `applied` suppressions
  refusedSuppressionCount: number;  // count of `refused-invariant` suppressions
  totalCostUsd: number;
  budgetUsd: number;
  // True iff any finding was skipped with reason="budget". Lets the renderer
  // distinguish "all clean, a few skipped renders" from "budget blew mid-run,
  // half the audit didn't run."
  budgetExhausted: boolean;
  blockingMode: "blocking" | "advisory-repo" | "advisory-pr";
  results: EvalResult[];
  // Every suppression seen in the diff: applied, refused, or unmatched. Goes
  // into the JSON audit + PR comment so reviewers can see what was bypassed.
  suppressions: SuppressionRecord[];
}
