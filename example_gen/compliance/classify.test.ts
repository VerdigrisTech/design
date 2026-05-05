import { classifyArtifact, applicableRules } from "./classify.js";
import type { Rule } from "./types.js";
import { strict as assert } from "node:assert";

const html = `<!doctype html><html><body class="vd-slide-deck" data-genre="pilot-kickoff" data-confidentiality="CUSTOMER-CONFIDENTIAL"><h1>Hi</h1></body></html>`;
const a = classifyArtifact("categories/slides/examples/foo.html", html);
assert.equal(a.type, "slides");
assert.equal(a.genre, "pilot_kickoff", "hyphen→underscore normalized");
assert.equal(a.confidentiality, "CUSTOMER-CONFIDENTIAL");

const rules: Rule[] = [
  { id: "color.brand.teal", namespace: "color", description: "", severity: "error", type: "value", maturity: "rule", test: { value: "#0fc8c3" }, evaluatorClass: "deterministic" },
  { id: "composition.persuade-pitch.required-toc", namespace: "composition", description: "", severity: "error", type: "constraint", maturity: "rule", modes: ["pilot_kickoff"], test: { llm_eval: "?" }, evaluatorClass: "visual-llm" },
  { id: "composition.persuade-whitepaper.cover-author", namespace: "composition", description: "", severity: "error", type: "constraint", maturity: "rule", modes: ["lab_tradition"], test: { llm_eval: "?" }, evaluatorClass: "visual-llm" },
];
const filtered = applicableRules(rules, a);
assert.equal(filtered.length, 2, "universal + matching-genre apply; non-matching genre filtered");
console.log("PASS: classify basic");
