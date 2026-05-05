import { synthesize } from "./synthesize.js";
import { strict as assert } from "node:assert";
import type { Finding } from "./types.js";

const findings: Finding[] = [
  // Blocking: error severity AND mature (rule).
  { ruleId: "a", artifactPath: "x.html", status: "fail", severity: "error", maturity: "rule" },
  // Advisory: error severity but experimental maturity (still in soak period).
  { ruleId: "b", artifactPath: "x.html", status: "fail", severity: "error", maturity: "experimental" },
  // Advisory: warning severity even though mature.
  { ruleId: "c", artifactPath: "x.html", status: "fail", severity: "warning", maturity: "rule" },
  // Advisory: error severity but convention maturity (deviation requires justification, not block).
  { ruleId: "f", artifactPath: "x.html", status: "fail", severity: "error", maturity: "convention" },
  // Blocking: invariant maturity also blocks.
  { ruleId: "g", artifactPath: "x.html", status: "fail", severity: "error", maturity: "invariant" },
  // Pass / skipped / n/a / suppressed go to their own buckets.
  { ruleId: "d", artifactPath: "x.html", status: "pass", severity: "error", maturity: "rule" },
  { ruleId: "e", artifactPath: "x.html", status: "skipped", severity: "error", maturity: "rule", skipReason: "budget" },
  { ruleId: "h", artifactPath: "x.html", status: "n/a", severity: "warning", maturity: "rule" },
  {
    ruleId: "i", artifactPath: "x.html", status: "suppressed", severity: "error", maturity: "rule",
    suppression: { ruleId: "i", reason: "approved", linear: "Z2O-1", file: "x.html", line: 1 },
  },
];
const s = synthesize(findings);
assert.equal(s.blocking.length, 2, "error+rule and error+invariant block");
assert.equal(s.advisory.length, 3, "experimental, warning, convention all advisory");
assert.equal(s.passed.length, 1);
assert.equal(s.skipped.length, 1);
assert.equal(s.na.length, 1);
assert.equal(s.suppressed.length, 1);
console.log("PASS: synthesize");
