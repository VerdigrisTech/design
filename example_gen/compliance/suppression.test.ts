import { parseSuppressions } from "./suppression.js";
import { strict as assert } from "node:assert";

const good = `
<!doctype html><html><body data-genre="pilot-kickoff">
<!-- compliance-audit:ignore brand.visual.no-generic-imagery reason="approved by Mark for Apex pilot" linear="Z2O-1402" -->
<h1>Hi</h1>
</body></html>`;
const sup = parseSuppressions("foo.html", good);
assert.equal(sup.length, 1);
assert.equal(sup[0].ruleId, "brand.visual.no-generic-imagery");
assert.equal(sup[0].linear, "Z2O-1402");

const badNoLinear = `<!-- compliance-audit:ignore brand.x reason="long enough" -->`;
assert.throws(() => parseSuppressions("foo.html", badNoLinear), /linear=/);

const badShortReason = `<!-- compliance-audit:ignore brand.x reason="x" linear="Z2O-1" -->`;
assert.throws(() => parseSuppressions("foo.html", badShortReason), /reason/);

const badTicket = `<!-- compliance-audit:ignore brand.x reason="long enough text" linear="JIRA-1" -->`;
assert.throws(() => parseSuppressions("foo.html", badTicket), /Z2O-/);

console.log("PASS: suppression parser");
