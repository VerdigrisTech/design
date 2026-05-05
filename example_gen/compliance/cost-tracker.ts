import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface Pricing {
  input_per_1m_usd: number;
  output_per_1m_usd: number;
}

const PRICING_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "pricing.json");
const PRICING: Pricing = JSON.parse(readFileSync(PRICING_PATH, "utf8"));

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
