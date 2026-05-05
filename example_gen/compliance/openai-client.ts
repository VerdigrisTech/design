import OpenAI from "openai";
import { Cache } from "./cache.js";
import type { Cassette } from "./cassette.js";
import type { CostTracker } from "./cost-tracker.js";

const MODEL = process.env.COMPLIANCE_AUDIT_MODEL ?? "gpt-4o";

export interface VisionRequest {
  imagePngBase64: string;
  systemPrompt: string;
  userPrompt: string;
  maxOutputTokens: number;
  estimatedInputTokens: number;
}
export interface TextRequest {
  systemPrompt: string;
  userPrompt: string;
  maxOutputTokens: number;
  estimatedInputTokens: number;
}
export interface CallResult {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
  fromCache: "live" | "cassette" | "cache";
}

export class BudgetExceededError extends Error {}

export class OpenAIClient {
  private client: OpenAI | null = null;
  constructor(
    private readonly cache: Cache,
    private readonly cassette: Cassette,
    private readonly cost: CostTracker,
  ) {}

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY required for live calls");
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  async callVision(req: VisionRequest): Promise<CallResult> {
    return this.dispatch(Cache.keyOf(req), req, "vision", req.estimatedInputTokens, req.maxOutputTokens);
  }
  async callText(req: TextRequest): Promise<CallResult> {
    return this.dispatch(Cache.keyOf(req), req, "text", req.estimatedInputTokens, req.maxOutputTokens);
  }

  private async dispatch(
    cacheKey: string,
    req: VisionRequest | TextRequest,
    kind: "vision" | "text",
    estIn: number,
    maxOut: number,
  ): Promise<CallResult> {
    const cached = this.cache.get<CallResult>(cacheKey);
    if (cached) return { ...cached, fromCache: "cache" };

    const cassetteKey = this.cassette.key(req);
    if (this.cassette.has(cassetteKey) && !this.cassette.isRecording()) {
      const entry = this.cassette.read(cassetteKey);
      const result = entry.response as CallResult;
      this.cache.set(cacheKey, result);
      return { ...result, fromCache: "cassette" };
    }

    const estCost = this.cost.estimate({ inputTokens: estIn, maxOutputTokens: maxOut });
    if (!this.cost.canAfford(estCost)) {
      throw new BudgetExceededError(
        `would exceed budget: estimated $${estCost.toFixed(3)}, spent $${this.cost.spent().toFixed(3)}`,
      );
    }

    let attempt = 0;
    while (true) {
      try {
        const resp = await this.live(req, kind);
        const inputTokens = resp.usage?.prompt_tokens ?? 0;
        const outputTokens = resp.usage?.completion_tokens ?? 0;
        this.cost.record({ inputTokens, outputTokens });
        const result: CallResult = {
          text: resp.choices[0]?.message?.content ?? "",
          usage: { inputTokens, outputTokens },
          fromCache: "live",
        };
        if (this.cassette.isRecording()) this.cassette.write(cassetteKey, { request: req, response: result });
        this.cache.set(cacheKey, result);
        return result;
      } catch (e: any) {
        attempt++;
        if (attempt >= 2) throw e;
        const status = e?.status ?? 0;
        if (status >= 500 || status === 429) {
          await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }
        throw e;
      }
    }
  }

  private async live(req: VisionRequest | TextRequest, kind: "vision" | "text") {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: req.systemPrompt },
    ];
    if (kind === "vision") {
      const v = req as VisionRequest;
      messages.push({
        role: "user",
        content: [
          { type: "text", text: v.userPrompt },
          { type: "image_url", image_url: { url: `data:image/png;base64,${v.imagePngBase64}`, detail: "high" } },
        ],
      });
    } else {
      messages.push({ role: "user", content: req.userPrompt });
    }
    return this.getClient().chat.completions.create({
      model: MODEL,
      max_tokens: req.maxOutputTokens,
      messages,
    });
  }
}
