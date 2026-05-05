import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import type { Rule, Maturity, EvaluatorClass, RuleTest } from "./types.js";

const PROSE_ID_TOKENS = [".voice.", ".diction.", ".tone.", ".audience-fit."];
// Top-level segments observed in rules/visual-rules.yml. Anything here routes to
// visual-LLM unless an earlier check (deterministic, prose-id-token, voice prefix)
// claims it. New namespaces added to the rules file should be added here too;
// unknown namespaces still default to visual-LLM with a one-time warning.
const VISUAL_NAMESPACES = new Set([
  "brand", "brand_rejections",
  "color", "typography", "spacing", "motion",
  "components", "breakpoints", "elevation", "accessibility",
  "device", "device_accessibility",
  "video", "visualizations", "viz",
  "three-d", "three_d_composition",
  "mdx", "composition",
]);

function isDeterministic(test: RuleTest): boolean {
  // A rule is deterministic only if it carries an extractor: a regex (capture or
  // presence), a forbidden pattern, or a literal value/values match. Bare min/max
  // without a regex has no way to extract a number from raw HTML, so those rules
  // must fall through to the visual-LLM evaluator. The presence of llm_eval also
  // forces LLM routing even if min/max are present (rubric semantics).
  if (test.llm_eval !== undefined) return false;
  return (
    test.regex !== undefined ||
    test.pattern !== undefined ||
    test.value !== undefined ||
    test.values !== undefined
  );
}

function classify(id: string, namespace: string, test: RuleTest): EvaluatorClass {
  if (isDeterministic(test)) return "deterministic";
  if (PROSE_ID_TOKENS.some((tok) => id.includes(tok))) return "prose-llm";
  if (namespace === "voice" || id.startsWith("brand_rejections.voice")) return "prose-llm";
  if (VISUAL_NAMESPACES.has(namespace)) return "visual-llm";
  console.warn(`[load-rules] unknown namespace "${namespace}" for rule "${id}"; defaulting to visual-llm`);
  return "visual-llm";
}

function normalizeMode(m: string): string {
  return m.replaceAll("-", "_");
}

function isRuleNode(v: unknown): v is { id: string; test: RuleTest; type?: string } & Record<string, unknown> {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as any).id === "string" &&
    typeof (v as any).test === "object" &&
    (v as any).test !== null &&
    (v as any).type !== "reference"
  );
}

function* walkRules(node: unknown): Generator<{ id: string; raw: any }> {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) yield* walkRules(item);
    return;
  }
  if (isRuleNode(node)) {
    yield { id: (node as any).id, raw: node };
    // Don't recurse into rule fields — rules are leaves.
    return;
  }
  for (const v of Object.values(node as Record<string, unknown>)) {
    yield* walkRules(v);
  }
}

export function loadRules(rulesPath: string): Rule[] {
  const raw = parseYaml(readFileSync(rulesPath, "utf8"));
  const out: Rule[] = [];
  const seen = new Set<string>();
  for (const { id, raw: r } of walkRules(raw)) {
    if (!id || !r.test) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    const namespace = id.split(".")[0]!;
    const test: RuleTest = r.test;
    out.push({
      id,
      namespace,
      description: r.description ?? "",
      severity: r.severity,
      type: r.type,
      maturity: (r.maturity as Maturity) ?? "rule",
      modes: Array.isArray(r.modes) ? r.modes.map(normalizeMode) : undefined,
      evaluator: r.evaluator,
      test,
      evaluatorClass: classify(id, namespace, test),
    });
  }
  return out;
}
