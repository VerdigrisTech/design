import { loadRules } from "./load-rules.js";
import { strict as assert } from "node:assert";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "load-rules-"));
const file = path.join(dir, "rules.yml");
writeFileSync(file, `
color:
  id: "color"
  type: "reference"
  description: "Color rules"
  rules:
    - id: "color.brand.teal"
      description: "Brand teal must be exact"
      severity: "error"
      type: "value"
      maturity: "rule"
      test:
        value: "#0fc8c3"
    - id: "color.brand.no-stock"
      description: "No generic imagery"
      severity: "error"
      type: "constraint"
      modes: ["pilot_kickoff", "customer_101"]
      test:
        llm_eval: "Does this surface use stock photography?"
    - id: "typography.line-height.body"
      description: "Body line-height in [1.4, 1.7]"
      severity: "warning"
      type: "constraint"
      maturity: "rule"
      test:
        min: 1.4
        max: 1.7
    - id: "spacing.scale-only-gap"
      description: "Gap value within scale, with extractor"
      severity: "error"
      type: "value"
      maturity: "rule"
      test:
        regex: "gap:\\\\s*(\\\\d+)px"
        min: 4
        max: 64

composition:
  id: "composition"
  type: "reference"
  rules:
    persuade_slide_deck:
      id: "composition.persuade-slide-deck"
      type: "reference"
      rules:
        - id: "composition.persuade-slide-deck.confidentiality-marking"
          description: "Confidentiality footer must match data-confidentiality."
          severity: "error"
          type: "constraint"
          maturity: "rule"
          test:
            llm_eval: "Is the footer confidentiality marker present and matching?"
        - id: "composition.persuade-slide-deck.logomark-consistency"
          description: "Logomark must be consistent."
          severity: "error"
          type: "constraint"
          maturity: "rule"
          test:
            llm_eval: "Is the logomark consistent across slides?"

    persuade_one_pager:
      id: "composition.persuade-one-pager"
      type: "reference"
      inherits_from_sales_collateral:
        - "composition.persuade-slide-deck.confidentiality-marking"
        - "composition.persuade-slide-deck.logomark-consistency"
      rules:
        - id: "composition.persuade-one-pager.thesis-block"
          description: "Comparative one-pager must carry a thesis block."
          severity: "warning"
          type: "constraint"
          maturity: "experimental"
          test:
            llm_eval: "Is the thesis block missing or weak?"
`);

const rules = loadRules(file);
const byId = (id: string) => rules.find((r) => r.id === id);

assert.ok(byId("color.brand.teal"), "color rule loaded");
assert.equal(byId("color.brand.teal")!.evaluatorClass, "deterministic");
assert.equal(byId("color.brand.no-stock")!.modes?.[0], "pilot_kickoff");
assert.equal(byId("color.brand.no-stock")!.evaluatorClass, "visual-llm");
assert.equal(byId("typography.line-height.body")!.evaluatorClass, "visual-llm",
  "bare min/max (no extractor) must fall through to visual-llm");
assert.equal(byId("spacing.scale-only-gap")!.evaluatorClass, "deterministic",
  "regex with min/max stays deterministic");

// Inheritance expansion: the one-pager cell declares
// inherits_from_sales_collateral with two slide-deck rule ids; loadRules must
// materialize a copy of each under the one-pager prefix so applicableRules
// can scope them correctly to one-pager artifacts.
assert.ok(byId("composition.persuade-slide-deck.confidentiality-marking"), "source rule retained");
assert.ok(byId("composition.persuade-one-pager.confidentiality-marking"),
  "inherited confidentiality-marking should appear under one-pager prefix");
assert.ok(byId("composition.persuade-one-pager.logomark-consistency"),
  "inherited logomark-consistency should appear under one-pager prefix");
assert.equal(
  byId("composition.persuade-one-pager.confidentiality-marking")!.severity,
  "error",
  "inherited rule preserves source severity",
);
assert.equal(
  byId("composition.persuade-one-pager.confidentiality-marking")!.evaluatorClass,
  "visual-llm",
  "inherited rule preserves evaluator class",
);

console.log("PASS: load-rules basic + inheritance");
