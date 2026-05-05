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

  // MODEL is part of every key. Without this, switching gpt-4o -> gpt-4o-mini
  // via env var would serve cached gpt-4o judgments under the cheaper model.
  // Bumped CACHE_NAMESPACE_VERSION to v2 in lockstep so old v1 hits are not
  // visible after this change lands.
  private keyFor(req: unknown): string { return Cache.keyOf({ model: MODEL, req }); }

  async callVision(req: VisionRequest): Promise<CallResult> {
    return this.dispatch(this.keyFor(req), req, "vision", req.estimatedInputTokens, req.maxOutputTokens);
  }
  async callText(req: TextRequest): Promise<CallResult> {
    return this.dispatch(this.keyFor(req), req, "text", req.estimatedInputTokens, req.maxOutputTokens);
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

    const cassetteKey = this.cassette.key(MODEL, req);
    if (this.cassette.has(cassetteKey) && !this.cassette.isRecording()) {
      // Defence-in-depth: cassette key already encodes (model, req), but also
      // verify the persisted request payload matches the current one. A
      // mismatch surfaces stale cassettes loudly instead of serving them.
      this.cassette.assertRequestMatches(cassetteKey, req);
      const entry = this.cassette.read(cassetteKey);
      const result = entry.response as CallResult;
      this.cache.set(cacheKey, result);
      return { ...result, fromCache: "cassette" };
    }

    const checkBudget = () => {
      const estCost = this.cost.estimate({ inputTokens: estIn, maxOutputTokens: maxOut });
      if (!this.cost.canAfford(estCost)) {
        throw new BudgetExceededError(
          `would exceed budget: estimated $${estCost.toFixed(3)}, spent $${this.cost.spent().toFixed(3)}`,
        );
      }
    };
    checkBudget();

    let attempt = 0;
    while (true) {
      try {
        // Re-check budget on retry. A first-attempt 5xx/429 still cost zero,
        // but if a parallel call recorded actual usage between attempts, the
        // budget may now be exhausted; fail fast instead of retrying past it.
        if (attempt > 0) checkBudget();
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
          // Honor Retry-After when the server provides it; OpenAI returns
          // seconds for 429s. Fall back to linear 500ms*attempt backoff.
          const retryAfterRaw = e?.headers?.["retry-after"] ?? e?.response?.headers?.["retry-after"];
          const retryAfterSec = typeof retryAfterRaw === "string" ? parseFloat(retryAfterRaw) : NaN;
          const delayMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
            ? Math.min(retryAfterSec * 1000, 30_000)
            : 500 * attempt;
          await new Promise((r) => setTimeout(r, delayMs));
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
      temperature: 0,
      messages,
    });
  }
}
