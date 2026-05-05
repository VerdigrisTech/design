import { CostTracker } from "./cost-tracker.js";
import { strict as assert } from "node:assert";

const t = new CostTracker(40);
const est1 = t.estimate({ inputTokens: 5000, maxOutputTokens: 200 });
assert.ok(est1 > 0 && est1 < 1, `estimate should be small for 1 call: got ${est1}`);
assert.ok(t.canAfford(est1), "budget should accommodate first call");
t.record({ inputTokens: 5000, outputTokens: 150 });
assert.ok(t.spent() > 0);
const huge = t.estimate({ inputTokens: 100_000_000, maxOutputTokens: 10000 });
assert.ok(!t.canAfford(huge), "should reject batch beyond budget");
console.log("PASS: cost tracker");
