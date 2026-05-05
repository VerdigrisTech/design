import { runDeterministic } from "./evaluator-deterministic.js";
import type { Rule, Artifact } from "./types.js";
import { strict as assert } from "node:assert";

const a: Artifact = {
  path: "foo.html",
  type: "slides",
  genre: "pilot_kickoff",
  html: `<style>.x{color:#ff0000;}.y{color:#0fc8c3;}</style>
    <div data-grid="3">first</div>
    <div data-grid="6">ok</div>
    <div data-grid="20">too big</div>`,
};

const rules: Rule[] = [
  {
    id: "color.brand.no-red",
    namespace: "color",
    description: "",
    severity: "error",
    type: "pattern",
    maturity: "rule",
    test: { pattern: "#ff0000" },
    evaluatorClass: "deterministic",
  },
  {
    id: "color.brand.teal-required",
    namespace: "color",
    description: "",
    severity: "warning",
    type: "pattern",
    maturity: "experimental",
    test: { regex: "#0fc8c3" },
    evaluatorClass: "deterministic",
  },
  {
    id: "spacing.grid.cols",
    namespace: "spacing",
    description: "",
    severity: "error",
    type: "value",
    maturity: "rule",
    test: { regex: 'data-grid="(\\d+)"', min: 4, max: 12 },
    evaluatorClass: "deterministic",
  },
];

const f = runDeterministic(a, rules);
assert.equal(
  f.find((x) => x.ruleId === "color.brand.no-red")?.status,
  "fail",
  "no-red rule should fail (forbidden pattern found)",
);
assert.equal(
  f.find((x) => x.ruleId === "color.brand.teal-required")?.status,
  "pass",
  "teal-required rule should pass (#0fc8c3 present)",
);
const grid = f.find((x) => x.ruleId === "spacing.grid.cols")!;
assert.equal(grid.status, "fail", "data-grid out of bounds");
// Both 3 and 20 should be aggregated into the message; the previous
// implementation reported only the first violation.
assert.match(grid.message ?? "", /3 < min 4/, "first violation reported");
assert.match(grid.message ?? "", /20 > max 12/, "second violation also reported");

// /g lastIndex bug: a forbidden-pattern test should give the same result on
// repeat calls. The old code shared regex state via the /g flag.
const repeat = runDeterministic(a, [rules[0]!]);
assert.equal(repeat[0]?.status, "fail", "repeat call still detects forbidden pattern");

console.log("PASS: deterministic eval");
