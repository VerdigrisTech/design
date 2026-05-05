import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface Pricing {
  input_per_1m_usd: number;
  output_per_1m_usd: number;
}

const PRICING_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "pricing.json");

function loadPricing(): Pricing {
  let raw: string;
  try {
    raw = readFileSync(PRICING_PATH, "utf8");
  } catch (e) {
    throw new Error(
      `compliance-audit: cannot read pricing.json at ${PRICING_PATH}. ` +
      `This file ships with the compliance-audit module; if it is missing, ` +
      `the install is corrupt — reinstall dependencies. Underlying: ${(e as Error).message}`,
    );
  }
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      `compliance-audit: pricing.json is malformed JSON at ${PRICING_PATH}. ` +
      `Underlying: ${(e as Error).message}`,
    );
  }
  if (
    typeof parsed?.input_per_1m_usd !== "number" ||
    typeof parsed?.output_per_1m_usd !== "number"
  ) {
    throw new Error(
      `compliance-audit: pricing.json missing required numeric fields ` +
      `input_per_1m_usd and output_per_1m_usd (path: ${PRICING_PATH}).`,
    );
  }
  return parsed as Pricing;
}

const PRICING: Pricing = loadPricing();

interface UsageEstimate { inputTokens: number; maxOutputTokens: number; }
interface UsageActual { inputTokens: number; outputTokens: number; }

export class CostTracker {
  private accumulated = 0;
  constructor(public readonly budgetUsd: number) {}

  estimate(u: UsageEstimate): number {
    return (
      (u.inputTokens / 1_000_000) * PRICING.input_per_1m_usd +
      (u.maxOutputTokens / 1_000_000) * PRICING.output_per_1m_usd
    );
  }
  record(u: UsageActual): number {
    const cost =
      (u.inputTokens / 1_000_000) * PRICING.input_per_1m_usd +
      (u.outputTokens / 1_000_000) * PRICING.output_per_1m_usd;
    this.accumulated += cost;
    return cost;
  }
  spent(): number { return this.accumulated; }
  canAfford(estimateUsd: number): boolean {
    return this.accumulated + estimateUsd <= this.budgetUsd;
  }
}
