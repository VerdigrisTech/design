import { chromium, type Browser } from "playwright";
import type { Artifact, Finding, Rule } from "./types.js";
import type { OpenAIClient } from "./openai-client.js";
import { BudgetExceededError } from "./openai-client.js";

const BATCH_SIZE = 8;
const MAX_HEIGHT_PX = 8000;

const SYSTEM = `You are a strict design-system auditor. For each numbered yes/no question about the supplied screenshot, answer ONLY with that number followed by YES or NO and a brief justification. Format: "1. YES — <12-word reason>". Convention: YES = violation found (rule fails). NO = condition met (rule passes). Do not hedge.`;

export async function runVisual(a: Artifact, rules: Rule[], client: OpenAIClient): Promise<Finding[]> {
  const visual = rules.filter((r) => r.evaluatorClass === "visual-llm");
  if (visual.length === 0) return [];

  let png: Buffer;
  try {
    png = await render(a.html);
  } catch (e: any) {
    return visual.map((r) => skip(a, r, "render", `render failed: ${e.message}`));
  }

  const findings: Finding[] = [];
  const batches = chunk(visual, BATCH_SIZE);
  for (const batch of batches) {
    try {
      const userPrompt = batch.map((r, i) => `${i + 1}. ${promptOf(r)}`).join("\n");
      const result = await client.callVision({
        imagePngBase64: png.toString("base64"),
        systemPrompt: SYSTEM,
        userPrompt,
        maxOutputTokens: 400,
        estimatedInputTokens: 6000,
      });
      const answers = parseAnswers(result.text, batch.length);
      batch.forEach((r, i) => findings.push(toFinding(a, r, answers[i] ?? null)));
    } catch (e) {
      const reason = e instanceof BudgetExceededError ? "budget" : "llm-error";
      for (const r of batch) findings.push(skip(a, r, reason, (e as Error).message));
      if (reason === "budget") break;
    }
  }
  return findings;
}

async function render(html: string): Promise<Buffer> {
  const browser: Browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.setContent(html, { waitUntil: "networkidle", timeout: 60000 });
    const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    if (fullHeight > MAX_HEIGHT_PX) {
      await page.setViewportSize({ width: 1440, height: MAX_HEIGHT_PX });
    }
    return page.screenshot({ fullPage: true, type: "png" });
  } finally {
    await browser.close();
  }
}

function promptOf(r: Rule): string {
  const t = r.test.llm_eval;
  if (typeof t === "string") return t;
  return t?.prompt ?? `Does this artifact violate "${r.id}"? YES/NO`;
}

function parseAnswers(text: string, n: number): ("YES" | "NO" | null)[] {
  const out: ("YES" | "NO" | null)[] = Array(n).fill(null);
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(\d+)\.\s+(YES|NO)\b/i);
    if (!m) continue;
    const idx = parseInt(m[1]!, 10) - 1;
    if (idx >= 0 && idx < n) out[idx] = m[2]!.toUpperCase() as "YES" | "NO";
  }
  return out;
}

function toFinding(a: Artifact, r: Rule, ans: "YES" | "NO" | null): Finding {
  const base = { ruleId: r.id, artifactPath: a.path, severity: r.severity, maturity: r.maturity };
  if (ans === null) return { ...base, status: "skipped", skipReason: "llm-error", message: "no answer parsed" };
  if (ans === "YES") return { ...base, status: "fail", llmAnswer: ans, message: `${r.description}` };
  return { ...base, status: "pass", llmAnswer: ans };
}

function skip(a: Artifact, r: Rule, reason: "budget" | "render" | "llm-error", message: string): Finding {
  return { ruleId: r.id, artifactPath: a.path, severity: r.severity, maturity: r.maturity, status: "skipped", skipReason: reason, message };
}

function chunk<T>(xs: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
  return out;
}
