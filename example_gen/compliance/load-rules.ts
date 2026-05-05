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

function isCellNode(v: unknown): v is { id: string; inherits_from_sales_collateral?: unknown } & Record<string, unknown> {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as any).id === "string" &&
    /^composition\.[a-z0-9-]+$/.test((v as any).id) &&
    (v as any).type === "reference"
  );
}

type WalkEvent =
  | { kind: "rule"; id: string; raw: any }
  | { kind: "inheritance"; cellId: string; sourceIds: string[] };

function* walk(node: unknown): Generator<WalkEvent> {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) yield* walk(item);
    return;
  }
  if (isRuleNode(node)) {
    yield { kind: "rule", id: (node as any).id, raw: node };
    // Don't recurse into rule fields — rules are leaves.
    return;
  }
  if (isCellNode(node)) {
    const inh = (node as any).inherits_from_sales_collateral;
    if (Array.isArray(inh) && inh.length > 0) {
      yield { kind: "inheritance", cellId: (node as any).id, sourceIds: inh.filter((s) => typeof s === "string") };
    }
  }
  for (const v of Object.values(node as Record<string, unknown>)) {
    yield* walk(v);
  }
}

function buildRule(id: string, namespace: string, raw: any): Rule {
  const test: RuleTest = raw.test;
  return {
    id,
    namespace,
    description: raw.description ?? "",
    severity: raw.severity,
    type: raw.type,
    maturity: (raw.maturity as Maturity) ?? "rule",
    modes: Array.isArray(raw.modes) ? raw.modes.map(normalizeMode) : undefined,
    evaluator: raw.evaluator,
    test,
    evaluatorClass: classify(id, namespace, test),
  };
}

function lastSegment(id: string): string {
  const i = id.lastIndexOf(".");
  return i === -1 ? id : id.slice(i + 1);
}

export function loadRules(rulesPath: string): Rule[] {
  const raw = parseYaml(readFileSync(rulesPath, "utf8"));
  const out: Rule[] = [];
  const seen = new Set<string>();
  const sourceIndex = new Map<string, any>();
  const inheritances: { cellId: string; sourceIds: string[] }[] = [];

  for (const ev of walk(raw)) {
    if (ev.kind === "rule") {
      if (!ev.id || !ev.raw.test) continue;
      sourceIndex.set(ev.id, ev.raw);
      if (seen.has(ev.id)) continue;
      seen.add(ev.id);
      const namespace = ev.id.split(".")[0]!;
      out.push(buildRule(ev.id, namespace, ev.raw));
    } else {
      inheritances.push({ cellId: ev.cellId, sourceIds: ev.sourceIds });
    }
  }

  // Expand inherits_from_sales_collateral. The semantics in CLAUDE.md: a derived
  // cell (one-pager, case-study, whitepaper-body) inherits selected slide-deck
  // rules so that, e.g., logomark-consistency applies to one-pagers without a
  // copy-paste duplicate in the YAML. We materialize the inheritance here by
  // cloning the source rule under the destination cell prefix and preserving
  // its last segment, so applicableRules' cell-prefix scoping naturally picks
  // it up. Without this step, the derived cells silently miss those rules.
  expandInheritances(inheritances, sourceIndex, seen, out);
  return out;
}

function expandInheritances(
  inheritances: { cellId: string; sourceIds: string[] }[],
  sourceIndex: Map<string, any>,
  seen: Set<string>,
  out: Rule[],
): void {
  // Cycle detection. If a future cell inherits from a cell that itself
  // inherits, the walker would otherwise loop forever or silently drop a
  // level. Build a directed inheritance graph keyed by source rule prefix
  // (the originating cellId) and refuse to expand a cycle.
  const inheritsByCell = new Map<string, Set<string>>();
  for (const { cellId, sourceIds } of inheritances) {
    const sourceCells = new Set<string>();
    for (const sid of sourceIds) {
      const dot = sid.indexOf(".examples.") >= 0 ? sid : sid;
      const sourceCell = dot.split(".").slice(0, 2).join(".");
      if (sourceCell) sourceCells.add(sourceCell);
    }
    inheritsByCell.set(cellId, sourceCells);
  }
  for (const cellId of inheritsByCell.keys()) {
    const visited = new Set<string>();
    const stack = [cellId];
    while (stack.length) {
      const cur = stack.pop()!;
      if (visited.has(cur)) {
        console.error(`[load-rules] inheritance cycle detected at "${cur}" (from "${cellId}"); refusing to expand`);
        return;
      }
      visited.add(cur);
      const next = inheritsByCell.get(cur);
      if (next) for (const n of next) if (n !== cur) stack.push(n);
    }
  }

  for (const { cellId, sourceIds } of inheritances) {
    for (const sourceId of sourceIds) {
      const sourceRaw = sourceIndex.get(sourceId);
      if (!sourceRaw) {
        console.warn(`[load-rules] inherits_from_sales_collateral references unknown rule "${sourceId}" from cell "${cellId}"`);
        continue;
      }
      const newId = `${cellId}.${lastSegment(sourceId)}`;
      if (seen.has(newId)) continue;
      seen.add(newId);
      const namespace = newId.split(".")[0]!;
      // Strip `modes:` on inheritance. The source rule's modes list is a set
      // of slide-deck genres (pilot_kickoff, customer_101, ...) which do not
      // exist in the destination cell. Inheriting them verbatim makes the
      // expanded rule a silent no-op for every genre in that destination
      // cell. The CLAUDE.md inheritance contract is for universals (logomark,
      // confidentiality, dates) that should apply across all genres.
      const cleanedRaw = (sourceRaw.modes !== undefined)
        ? { ...sourceRaw, modes: undefined }
        : sourceRaw;
      out.push(buildRule(newId, namespace, cleanedRaw));
    }
  }
}
