import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import type { Rule, Maturity, EvaluatorClass, RuleTest } from "./types.js";

const PROSE_ID_TOKENS = [".voice.", ".diction.", ".tone.", ".audience-fit."];
const VISUAL_NAMESPACES = new Set([
  "brand", "brand_rejections", "color", "typography", "spacing", "motion",
  "components", "composition", "breakpoints", "elevation", "accessibility",
  "device", "device_accessibility", "video", "visualizations", "viz",
  "three_d", "three-d", "three_d_composition", "mdx",
]);

function isDeterministic(test: RuleTest): boolean {
  return (
    test.regex !== undefined ||
    test.value !== undefined ||
    test.values !== undefined ||
    test.min !== undefined ||
    test.max !== undefined ||
    test.pattern !== undefined
  );
}

function classify(id: string, namespace: string, test: RuleTest): EvaluatorClass {
  if (isDeterministic(test)) return "deterministic";
  if (PROSE_ID_TOKENS.some((tok) => id.includes(tok))) return "prose-llm";
  if (namespace === "voice" || id.startsWith("brand_rejections.voice")) return "prose-llm";
  if (VISUAL_NAMESPACES.has(namespace)) return "visual-llm";
  // Unknown namespace: warn and default to visual-llm
  console.warn(`[load-rules] unknown namespace "${namespace}" for rule "${id}"; defaulting to visual-llm`);
  return "visual-llm";
}

function normalizeMode(m: string): string {
  return m.replaceAll("-", "_");
}

function* walk(node: unknown, prefix = ""): Generator<{ id: string; raw: any }> {
  if (node === null || typeof node !== "object") return;
  for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
    if (key === "id" || key === "type" || key === "description" || key === "rules") continue;
    if (val && typeof val === "object" && "rules" in (val as object)) {
      const sub = val as { rules?: unknown[] };
      if (Array.isArray(sub.rules)) {
        for (const r of sub.rules) yield { id: (r as any).id, raw: r };
      }
      yield* walk(val, `${prefix}${key}.`);
    } else if (val && typeof val === "object") {
      yield* walk(val, `${prefix}${key}.`);
    }
  }
}

export function loadRules(rulesPath: string): Rule[] {
  const raw = parseYaml(readFileSync(rulesPath, "utf8"));
  const out: Rule[] = [];
  for (const { id, raw: r } of walk(raw)) {
    if (!id || !r.test) continue;
    if (r.type === "reference") continue;
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
