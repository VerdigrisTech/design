import { synthesize } from "./synthesize.js";
import { strict as assert } from "node:assert";
import type { Finding } from "./types.js";

const findings: Finding[] = [
  { ruleId: "a", artifactPath: "x.html", status: "fail", severity: "error", maturity: "rule" },
  { ruleId: "b", artifactPath: "x.html", status: "fail", severity: "error", maturity: "experimental" },
  { ruleId: "c", artifactPath: "x.html", status: "fail", severity: "warning", maturity: "rule" },
  { ruleId: "d", artifactPath: "x.html", status: "pass", severity: "error", maturity: "rule" },
  { ruleId: "e", artifactPath: "x.html", status: "skipped", severity: "error", maturity: "rule", skipReason: "budget" },
];
const s = synthesize(findings);
assert.equal(s.blocking.length, 1, "only error+rule|invariant blocks");
assert.equal(s.advisory.length, 2, "experimental + warning are advisory");
assert.equal(s.skipped.length, 1);
assert.equal(s.passed.length, 1);
console.log("PASS: synthesize");
