import { classifyArtifact, applicableRules } from "./classify.js";
import type { Rule } from "./types.js";
import { strict as assert } from "node:assert";

const html = `<!doctype html><html><body class="vd-slide-deck" data-genre="pilot-kickoff" data-confidentiality="CUSTOMER-CONFIDENTIAL"><h1>Hi</h1></body></html>`;
const a = classifyArtifact("categories/slides/examples/foo.html", html);
assert.equal(a.type, "slides");
assert.equal(a.genre, "pilot_kickoff", "hyphen->underscore normalized");
assert.equal(a.confidentiality, "CUSTOMER-CONFIDENTIAL");

const rules: Rule[] = [
  // Cross-cutting (no artifact-bound cell prefix). Applies to everything.
  { id: "color.brand.teal", namespace: "color", description: "", severity: "error", type: "value", maturity: "rule", test: { value: "#0fc8c3" }, evaluatorClass: "deterministic" },
  // Slide-deck cell, matching genre. Applies.
  { id: "composition.persuade-slide-deck.foo", namespace: "composition", description: "", severity: "error", type: "constraint", maturity: "rule", modes: ["pilot_kickoff"], test: { llm_eval: "?" }, evaluatorClass: "visual-llm" },
  // Slide-deck cell, non-matching genre. Filtered by modes.
  { id: "composition.persuade-slide-deck.bar", namespace: "composition", description: "", severity: "error", type: "constraint", maturity: "rule", modes: ["customer_101"], test: { llm_eval: "?" }, evaluatorClass: "visual-llm" },
  // One-pager cell. Filtered: artifact is slides, this rule belongs to a one-pager.
  { id: "composition.persuade-one-pager.baz", namespace: "composition", description: "", severity: "error", type: "constraint", maturity: "rule", test: { llm_eval: "?" }, evaluatorClass: "visual-llm" },
  // Whitepaper cell. Filtered: not slides/one-pagers.
  { id: "composition.persuade-whitepaper-cover.qux", namespace: "composition", description: "", severity: "error", type: "constraint", maturity: "rule", test: { llm_eval: "?" }, evaluatorClass: "visual-llm" },
];
const filtered = applicableRules(rules, a);
const ids = filtered.map((r) => r.id).sort();
assert.deepEqual(ids, [
  "color.brand.teal",
  "composition.persuade-slide-deck.foo",
], `slide artifact should keep cross-cutting + matching slide-deck rule; got ${JSON.stringify(ids)}`);

// Also check that fixture paths classify correctly.
const fixtureSlides = classifyArtifact(
  "tests/compliance/fixtures/passing/slides/abcam-kickoff.html",
  html,
);
assert.equal(fixtureSlides.type, "slides");

console.log("PASS: classify basic");
