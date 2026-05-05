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

  // pattern: forbidden pattern detection (should NOT match). No /g flag —
  // RegExp.test on a /g-flagged regex carries lastIndex state and is a footgun
  // even when the regex object is freshly constructed.
  if (t.pattern) {
    const re = new RegExp(t.pattern);
    return re.test(a.html)
      ? {
          ...base,
          status: "fail",
          message: `forbidden pattern ${t.pattern} present`,
        }
      : { ...base, status: "pass" };
  }

  // regex with min/max: numeric bounds check. Aggregate every out-of-range
  // value before returning so producers see the full picture in one pass
  // rather than fixing the first failure and discovering a second next run.
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

    const violations: string[] = [];
    for (const m of matches) {
      const captured = Number(m[1] ?? m[0]);
      if (Number.isNaN(captured)) {
        violations.push(`non-numeric "${m[0]}"`);
        continue;
      }
      if (t.min !== undefined && captured < t.min) {
        violations.push(`${captured} < min ${t.min}`);
        continue;
      }
      if (t.max !== undefined && captured > t.max) {
        violations.push(`${captured} > max ${t.max}`);
      }
    }
    if (violations.length > 0) {
      return {
        ...base,
        status: "fail",
        message: `${violations.length} value(s) out of range: ${violations.join("; ")}`,
      };
    }
    return { ...base, status: "pass" };
  }

  // regex alone: presence check (should match). No /g flag, see note above.
  if (t.regex) {
    const re = new RegExp(t.regex);
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
    skipReason: "config-error",
    message: "deterministic test had no recognized form",
  };
}
