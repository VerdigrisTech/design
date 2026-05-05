import { load as loadHtml } from "cheerio";
import { readFileSync, readdirSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import path from "node:path";
import type { Artifact, Finding, Rule } from "./types.js";
import type { OpenAIClient } from "./openai-client.js";
import { BudgetExceededError } from "./openai-client.js";

const BATCH_SIZE = 8;
const MIN_PROSE_CHARS = 50;
const MAX_PROSE_CHARS = 32_000;

const SYSTEM = `You are a strict voice/prose auditor. Apply the supplied design-system voice profile when judging. For each numbered yes/no question about the prose excerpt, answer ONLY with that number followed by YES or NO and a brief justification. Format: "1. YES — <12-word reason>". YES = violation. NO = compliant.`;

export function extractProse(html: string): string {
  const $ = loadHtml(html);
  $("script,style,noscript").remove();
  const altText = $("img[alt]").map((_, el) => $(el).attr("alt")).get().join(" ");
  const bodyText = $("body").text();
  const combined = `${bodyText} ${altText}`
    .replaceAll(/ |&nbsp;/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
  return combined.slice(0, MAX_PROSE_CHARS);
}

export function loadVoiceContext(repoRoot: string, genre: string): string {
  const recipesPath = path.join(repoRoot, "voice/recipes.yaml");
  const recipesParsed = parseYaml(readFileSync(recipesPath, "utf8"));
  const recipes = recipesParsed?.recipes ?? recipesParsed ?? [];
  const list: any[] = Array.isArray(recipes) ? recipes : Object.entries(recipes).map(([k, v]) => ({ id: k, ...(v as object) }));
  const match = list.find((r: any) => r.genre === genre || r.id === genre);
  if (!match) return "";
  const profileNames: string[] = match.voice_sources ?? match.voices ?? [];
  const teamDir = path.join(repoRoot, "voice/team");
  const profiles: string[] = [];
  try {
    const teamFiles = readdirSync(teamDir);
    for (const name of profileNames) {
      const file = teamFiles.find((f) => f.toLowerCase().includes(String(name).toLowerCase()));
      if (file) profiles.push(`# ${name}\n${readFileSync(path.join(teamDir, file), "utf8")}`);
    }
  } catch { /* dir may not exist; degrade gracefully */ }
  return [
    `# Recipe: ${match.id ?? match.genre}`,
    JSON.stringify(match, null, 2),
    "",
    "# Voice profiles",
    ...profiles,
  ].join("\n");
}

export async function runProse(
  a: Artifact, rules: Rule[], repoRoot: string, client: OpenAIClient,
): Promise<Finding[]> {
  const prose = extractProse(a.html);
  const proseRules = rules.filter((r) => r.evaluatorClass === "prose-llm");
  if (proseRules.length === 0) return [];
  if (prose.length < MIN_PROSE_CHARS) {
    return proseRules.map((r) => ({
      ruleId: r.id, artifactPath: a.path, severity: r.severity, maturity: r.maturity,
      status: "n/a", message: `prose extraction yielded ${prose.length} chars; below ${MIN_PROSE_CHARS} threshold`,
    }));
  }
  const voice = loadVoiceContext(repoRoot, a.genre);
  const findings: Finding[] = [];
  const batches = chunk(proseRules, BATCH_SIZE);
  for (const batch of batches) {
    const questions = batch.map((r, i) => `${i + 1}. ${promptOf(r)}`).join("\n");
    const userPrompt = [
      "## Voice context",
      voice || "(no recipe matched genre)",
      "",
      "## Prose excerpt",
      prose,
      "",
      "## Questions",
      questions,
    ].join("\n");
    try {
      const result = await client.callText({
        systemPrompt: SYSTEM,
        userPrompt,
        maxOutputTokens: 400,
        estimatedInputTokens: Math.ceil((voice.length + prose.length + questions.length) / 4),
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

function promptOf(r: Rule) { return typeof r.test.llm_eval === "string" ? r.test.llm_eval : (r.test.llm_eval?.prompt ?? r.id); }
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
  if (ans === "YES") return { ...base, status: "fail", llmAnswer: ans, message: r.description };
  return { ...base, status: "pass", llmAnswer: ans };
}
function skip(a: Artifact, r: Rule, reason: "budget" | "render" | "llm-error", message: string): Finding {
  return { ruleId: r.id, artifactPath: a.path, severity: r.severity, maturity: r.maturity, status: "skipped", skipReason: reason, message };
}
function chunk<T>(xs: T[], n: number): T[][] {
  const out: T[][] = []; for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n)); return out;
}
