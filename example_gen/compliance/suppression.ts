import type { Suppression } from "./types.js";

const COMMENT_RE = /<!--\s*compliance-audit:ignore\s+([^\s]+)([^>]*?)-->/g;

function extractField(body: string, key: string): string | undefined {
  const re = new RegExp(`${key}="([^"]*)"`);
  const m = body.match(re);
  return m ? m[1] : undefined;
}

export function parseSuppressions(file: string, html: string): Suppression[] {
  const out: Suppression[] = [];
  for (const m of html.matchAll(COMMENT_RE)) {
    const ruleId = m[1];
    const tail = m[2] ?? "";
    const reason = extractField(tail, "reason");
    const linear = extractField(tail, "linear");
    if (linear === undefined) {
      throw new Error(`${file}: suppression for ${ruleId} requires linear="Z2O-NNN" (no linear= field)`);
    }
    if (reason === undefined || reason.length < 10) {
      throw new Error(`${file}: suppression for ${ruleId} requires reason="..." with at least 10 chars`);
    }
    if (!/^Z2O-\d+$/.test(linear)) {
      throw new Error(`${file}: suppression for ${ruleId} requires linear="Z2O-NNN", got "${linear}"`);
    }
    const line = html.slice(0, m.index ?? 0).split("\n").length;
    out.push({ ruleId, reason, linear, file, line });
  }
  return out;
}
