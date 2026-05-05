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
`);

const rules = loadRules(file);

// Reference container is excluded; only enforceable rules returned
assert.equal(rules.length, 2, "should flatten nested rules and skip reference container");
assert.equal(rules[0].id, "color.brand.teal");
assert.equal(rules[0].namespace, "color");
assert.equal(rules[0].maturity, "rule");
assert.equal(rules[1].modes?.[0], "pilot_kickoff");
assert.equal(rules[1].evaluatorClass, "visual-llm"); // namespace=color, has llm_eval, no prose token
console.log("PASS: load-rules basic");
