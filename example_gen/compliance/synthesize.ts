import type { Finding } from "./types.js";

export interface Synthesis {
  blocking: Finding[];
  advisory: Finding[];
  skipped: Finding[];
  passed: Finding[];
  na: Finding[];
  suppressed: Finding[];
}

export function synthesize(findings: Finding[]): Synthesis {
  const out: Synthesis = { blocking: [], advisory: [], skipped: [], passed: [], na: [], suppressed: [] };
  for (const f of findings) {
    if (f.status === "skipped") { out.skipped.push(f); continue; }
    if (f.status === "pass") { out.passed.push(f); continue; }
    if (f.status === "n/a") { out.na.push(f); continue; }
    if (f.status === "suppressed") { out.suppressed.push(f); continue; }
    // fail
    if (f.severity === "error" && (f.maturity === "rule" || f.maturity === "invariant")) {
      out.blocking.push(f);
    } else {
      out.advisory.push(f);
    }
  }
  return out;
}

export function applySuppressions(findings: Finding[], suppressions: import("./types.js").Suppression[]): Finding[] {
  const supByRule = new Map(suppressions.map((s) => [s.ruleId, s] as const));
  return findings.map((f) => {
    if (f.status !== "fail") return f;
    const sup = supByRule.get(f.ruleId);
    if (!sup) return f;
    return { ...f, status: "suppressed" as const, suppression: sup };
  });
}
