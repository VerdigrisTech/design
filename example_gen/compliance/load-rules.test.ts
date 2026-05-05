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
        llm_eval: "Does this surface use stock photography? YES if so, NO otherwise."
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
`);

const rules = loadRules(file);

// Reference container is excluded; only enforceable rules returned
assert.equal(rules.length, 4, "should flatten nested rules and skip reference container");
const byId = (id: string) => rules.find((r) => r.id === id)!;
assert.equal(byId("color.brand.teal").namespace, "color");
assert.equal(byId("color.brand.teal").maturity, "rule");
assert.equal(byId("color.brand.teal").evaluatorClass, "deterministic");
assert.equal(byId("color.brand.no-stock").modes?.[0], "pilot_kickoff");
assert.equal(byId("color.brand.no-stock").evaluatorClass, "visual-llm");
// Bare min/max with NO regex/value/pattern must NOT be deterministic — there's no way
// to extract a number from raw HTML. Falls through to visual-llm.
assert.equal(byId("typography.line-height.body").evaluatorClass, "visual-llm",
  "bare min/max (no extractor) must fall through to visual-llm");
// regex+min/max IS deterministic — the regex gives us the extractor.
assert.equal(byId("spacing.scale-only-gap").evaluatorClass, "deterministic",
  "regex with min/max stays deterministic");
console.log("PASS: load-rules basic");
