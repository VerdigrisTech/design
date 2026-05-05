import { extractProse } from "./evaluator-prose.js";
import { strict as assert } from "node:assert";

const html = `<style>.x{color:red}</style><script>var a=1;</script><body><h1>Hi  there</h1><img alt="solar farm"><p>Some&nbsp;text.</p></body>`;
const prose = extractProse(html);
assert.ok(prose.includes("Hi there"));
assert.ok(prose.includes("solar farm"), "alt text preserved");
assert.ok(!prose.includes("var a=1"), "scripts stripped");
assert.ok(!prose.includes("color:red"), "styles stripped");
console.log("PASS: prose extraction");
