import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { RunSummary } from "./types.js";
import { synthesize } from "./synthesize.js";

export function writeReports(repoRoot: string, summary: RunSummary, sha: string): { md: string; json: string } {
  const dir = join(repoRoot, "audits/compliance");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15) + "Z";
  const base = `${ts}-${sha.slice(0, 8)}`;
  const md = join(dir, `${base}.md`);
  const json = join(dir, `${base}.json`);
  writeFileSync(md, renderMarkdown(summary));
  writeFileSync(json, JSON.stringify(summary, null, 2));
  return { md, json };
}

export function renderMarkdown(s: RunSummary): string {
  const lines: string[] = [];
  lines.push(`# compliance-audit report`);
  lines.push("");
  lines.push(`- mode: **${s.blockingMode}**`);
  lines.push(`- artifacts evaluated: ${s.results.length}`);
  lines.push(`- findings: ${s.blockingCount} blocking, ${s.advisoryCount} advisory, ${s.skippedCount} skipped, ${s.passedCount} passed`);
  lines.push(`- spend: $${s.totalCostUsd.toFixed(2)} / $${s.budgetUsd.toFixed(2)}`);
  lines.push("");
  for (const r of s.results) {
    const syn = synthesize(r.findings);
    lines.push(`## ${r.artifact.path}`);
    lines.push(`- type: ${r.artifact.type}, genre: ${r.artifact.genre}`);
    if (syn.blocking.length) {
      lines.push(`### Blocking (${syn.blocking.length})`);
      for (const f of syn.blocking) lines.push(`- **${f.ruleId}** — ${f.message ?? ""}`);
    }
    if (syn.advisory.length) {
      lines.push(`### Advisory (${syn.advisory.length})`);
      for (const f of syn.advisory) lines.push(`- ${f.ruleId} (${f.severity}/${f.maturity}) — ${f.message ?? ""}`);
    }
    if (syn.skipped.length) {
      lines.push(`### Skipped (${syn.skipped.length})`);
      for (const f of syn.skipped) lines.push(`- ${f.ruleId} — ${f.skipReason}: ${f.message ?? ""}`);
    }
    if (syn.suppressed.length) {
      lines.push(`### Suppressed (${syn.suppressed.length})`);
      for (const f of syn.suppressed) lines.push(`- ${f.ruleId} — ${f.suppression?.linear} (${f.suppression?.reason})`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function renderPrCommentSection(s: RunSummary): string {
  const lines: string[] = [];
  lines.push("── compliance-audit ────────────────────────────────────────");
  lines.push(`evaluated ${s.results.length} examples • ${s.blockingCount === 0 ? "pass" : "fail"} • $${s.totalCostUsd.toFixed(2)} / $${s.budgetUsd.toFixed(2)}`);
  lines.push("");
  lines.push(`  Failures (block merge)         — ${s.blockingCount}`);
  lines.push(`  Advisory findings              — ${s.advisoryCount}`);
  lines.push(`  Skipped (budget / errors)      — ${s.skippedCount}`);
  lines.push(`  Passed                         — ${s.passedCount}`);
  return lines.join("\n");
}
