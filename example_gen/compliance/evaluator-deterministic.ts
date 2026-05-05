import type { Artifact, Finding, Rule } from "./types.js";

export function runDeterministic(a: Artifact, rules: Rule[]): Finding[] {
  return rules
    .filter((r) => r.evaluatorClass === "deterministic")
    .map((r) => evalOne(a, r));
}

function evalOne(a: Artifact, r: Rule): Finding {
  const base: Pick<
    Finding,
    "ruleId" | "artifactPath" | "severity" | "maturity"
  > = {
    ruleId: r.id,
    artifactPath: a.path,
    severity: r.severity,
    maturity: r.maturity,
  };

  const t = r.test;

  // pattern: forbidden pattern detection (should NOT match)
  if (t.pattern) {
    const re = new RegExp(t.pattern, "g");
    return re.test(a.html)
      ? {
          ...base,
          status: "fail",
          message: `forbidden pattern ${t.pattern} present`,
        }
      : { ...base, status: "pass" };
  }

  // regex with min/max: numeric bounds check
  if (t.regex && (t.min !== undefined || t.max !== undefined)) {
    const re = new RegExp(t.regex, "g");
    const matches = [...a.html.matchAll(re)];

    if (matches.length === 0) {
      return {
        ...base,
        status: "fail",
        message: `pattern ${t.regex} not found; numeric bounds [${t.min}..${t.max}] not satisfiable`,
      };
    }

    for (const m of matches) {
      const captured = Number(m[1] ?? m[0]);
      if (Number.isNaN(captured)) {
        return {
          ...base,
          status: "fail",
          message: `regex ${t.regex} captured non-numeric value: ${m[0]}`,
        };
      }
      if (t.min !== undefined && captured < t.min) {
        return {
          ...base,
          status: "fail",
          message: `value ${captured} below min ${t.min}`,
        };
      }
      if (t.max !== undefined && captured > t.max) {
        return {
          ...base,
          status: "fail",
          message: `value ${captured} above max ${t.max}`,
        };
      }
    }
    return { ...base, status: "pass" };
  }

  // regex alone: presence check (should match)
  if (t.regex) {
    const re = new RegExp(t.regex, "g");
    return re.test(a.html)
      ? { ...base, status: "pass" }
      : {
          ...base,
          status: "fail",
          message: `pattern ${t.regex} not found`,
        };
  }

  // value: exact string/number presence
  if (t.value !== undefined) {
    return a.html.includes(String(t.value))
      ? { ...base, status: "pass" }
      : {
          ...base,
          status: "fail",
          message: `expected value "${t.value}" not found`,
        };
  }

  // values: any of the allowed values present
  if (t.values !== undefined) {
    const ok = t.values.some((v) => a.html.includes(String(v)));
    return ok
      ? { ...base, status: "pass" }
      : {
          ...base,
          status: "fail",
          message: `none of allowed values ${JSON.stringify(t.values)} found`,
        };
  }

  // no recognized test form
  return {
    ...base,
    status: "skipped",
    skipReason: "llm-error",
    message: "deterministic test had no recognized form",
  };
}
