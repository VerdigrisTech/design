/**
 * Self-test runner for the cohesion audit script.
 *
 * Runs cohesion.ts against tests/audit/fixtures/seeded-findings/ and compares
 * the resulting JSON sidecar to tests/audit/fixtures/expected.json.
 *
 * Pass bar (per DESIGN.md Loop 5): recall >= 80%, precision >= 80%.
 *
 * Each expected entry is a { dimension, severity, citationPattern, summaryPattern }
 * tuple. An expected entry "matches" when at least one actual finding has the
 * same dimension and severity, AND its citation matches the citationPattern
 * regex AND its summary matches the summaryPattern regex.
 */

import { readFileSync, existsSync, readdirSync, mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const FIXTURE = join(ROOT, "tests", "audit", "fixtures", "seeded-findings");
const EXPECTED = join(ROOT, "tests", "audit", "fixtures", "expected.json");

type Expected = {
  dimension: string;
  severity: string;
  citationPattern: string;
  summaryPattern: string;
};

type Finding = {
  dimension: string;
  severity: string;
  summary: string;
  citation: string;
};

function main() {
  if (!existsSync(FIXTURE)) {
    console.error(`  ERROR: fixture missing at ${FIXTURE}`);
    process.exit(1);
  }

  // Run cohesion.ts with VD_ROOT pointed at the fixture.
  const scriptPath = join(ROOT, "build", "audit", "cohesion.ts");
  const auditOutDir = join(FIXTURE, "audits", "cohesion");

  // Remove any prior fixture audit output so the test is idempotent.
  if (existsSync(auditOutDir)) {
    rmSync(auditOutDir, { recursive: true, force: true });
  }

  console.log("Running cohesion audit against fixture...");
  try {
    execFileSync("npx", ["tsx", scriptPath], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, VD_ROOT: FIXTURE },
    });
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer };
    console.error("  ERROR: cohesion.ts crashed");
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    process.exit(1);
  }

  if (!existsSync(auditOutDir)) {
    console.error(`  ERROR: cohesion.ts did not write audits/cohesion/ under fixture`);
    process.exit(1);
  }
  const reports = readdirSync(auditOutDir).filter(f => f.endsWith(".json"));
  if (reports.length === 0) {
    console.error("  ERROR: no JSON sidecar emitted by fixture run");
    process.exit(1);
  }
  reports.sort();
  const latestJson = join(auditOutDir, reports[reports.length - 1]);

  const expected = JSON.parse(readFileSync(EXPECTED, "utf-8")).expected as Expected[];
  const actualWrap = JSON.parse(readFileSync(latestJson, "utf-8")) as { findings: Finding[] };
  const actual = actualWrap.findings;

  console.log(`  Expected: ${expected.length} findings`);
  console.log(`  Actual:   ${actual.length} findings`);
  console.log("");

  // For each expected entry, find ANY actual finding that matches and has not
  // yet been claimed by an earlier expected entry. This keeps precision honest:
  // one actual finding cannot satisfy multiple expected entries.
  const matchedActualIdx = new Set<number>();
  let recall = 0;
  for (const e of expected) {
    const citePat = new RegExp(e.citationPattern);
    const sumPat = new RegExp(e.summaryPattern, "i");
    let matched = false;
    for (let i = 0; i < actual.length; i++) {
      if (matchedActualIdx.has(i)) continue;
      const a = actual[i];
      if (a.dimension !== e.dimension) continue;
      if (a.severity !== e.severity) continue;
      if (!citePat.test(a.citation)) continue;
      if (!sumPat.test(a.summary)) continue;
      matched = true;
      matchedActualIdx.add(i);
      break;
    }
    if (matched) {
      recall++;
      console.log(`  PASS [${e.dimension} ${e.severity}] ${e.summaryPattern}`);
    } else {
      console.log(`  MISS [${e.dimension} ${e.severity}] ${e.summaryPattern} (no actual finding matched)`);
    }
  }

  // Precision: of the actual findings, how many were "expected" (matched at least one expected)?
  // We allow other "incidental" findings (e.g., font-size scale notes from the small fixture)
  // to count as expected if they appear inside the _test sub-tree (since the fixture is the
  // only thing we should be auditing).
  // Strict precision: actual finding is "expected" iff it was the match for some expected entry.
  const precisionMatched = matchedActualIdx.size;
  const precision = actual.length === 0 ? 1 : precisionMatched / actual.length;
  const recallRatio = expected.length === 0 ? 1 : recall / expected.length;

  console.log("");
  console.log(`Recall:    ${recall}/${expected.length} = ${(recallRatio * 100).toFixed(1)}%`);
  console.log(`Precision: ${precisionMatched}/${actual.length} = ${(precision * 100).toFixed(1)}%`);
  console.log("");

  // List unexpected (extra) findings that may need allowlisting or a new expected entry.
  const extras: Finding[] = [];
  for (let i = 0; i < actual.length; i++) {
    if (!matchedActualIdx.has(i)) extras.push(actual[i]);
  }
  if (extras.length > 0) {
    console.log(`Extras (actual findings not paired with an expected entry): ${extras.length}`);
    for (const x of extras.slice(0, 10)) {
      console.log(`  - [${x.dimension} ${x.severity}] ${x.summary}  (${x.citation})`);
    }
    if (extras.length > 10) console.log(`  ...and ${extras.length - 10} more`);
  }

  const recallPass = recallRatio >= 0.8;
  const precisionPass = precision >= 0.8;
  const overall = recallPass && precisionPass;

  console.log("");
  console.log(`Recall    >= 80%: ${recallPass ? "PASS" : "FAIL"}`);
  console.log(`Precision >= 80%: ${precisionPass ? "PASS" : "FAIL"}`);
  console.log(`Overall:          ${overall ? "PASS" : "FAIL"}`);

  process.exit(overall ? 0 : 1);
}

main();
