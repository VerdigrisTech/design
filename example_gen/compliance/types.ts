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
  skipReason?: "budget" | "render" | "llm-error" | "render-failure";
  suppression?: Suppression;
  costUsd?: number;              // share of batch cost attributed to this rule
}

export interface EvalResult {
  artifact: Artifact;
  findings: Finding[];
  totalCostUsd: number;
  startedAt: string;             // ISO
  finishedAt: string;
}

export interface RunSummary {
  blockingCount: number;
  advisoryCount: number;
  skippedCount: number;
  passedCount: number;
  totalCostUsd: number;
  budgetUsd: number;
  blockingMode: "blocking" | "advisory-repo" | "advisory-pr";
  results: EvalResult[];
}
