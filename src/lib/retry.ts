import { client } from '@/lib/gemini';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extract a retry delay (in seconds) from a Gemini API error message.
 * Looks for patterns like "retry in 57.73s" or "retryDelay":"57s".
 */
function extractRetryDelay(error: unknown): number | null {
  try {
    const message = error instanceof Error ? error.message : String(error);
    // Match "retry in 57.730453894s" or "Please retry in 12s"
    const inlineMatch = message.match(/retry in ([\d.]+)s/i);
    if (inlineMatch) return Math.ceil(parseFloat(inlineMatch[1]));
    // Match "retryDelay":"57s"
    const jsonMatch = message.match(/"retryDelay"\s*:\s*"(\d+)s"/);
    if (jsonMatch) return parseInt(jsonMatch[1]);
  } catch { /* ignore parsing failures */ }
  return null;
}

/**
 * Check if a Gemini API error is retryable (503 or 429).
 */
function isRetryableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const status = (error as any)?.status;
  return status === 429 || status === 503 || message.includes('503') || message.includes('429') || message.includes('UNAVAILABLE') || message.includes('RESOURCE_EXHAUSTED');
}

interface GenerateOptions {
  model: string;
  parts: any[];
}

type RetryResult =
  | { ok: true; result: any }
  | { ok: false; retryAfterSec: number; error: unknown };

/**
 * Attempt content generation with a single model, retrying on transient errors.
 * - Up to `maxRetries` retry attempts
 * - Server-side waits are capped at `maxWaitMs` (default 12s) per attempt
 * - If the API suggests a longer wait, returns { ok: false, retryAfterSec } instead of retrying
 */
export async function generateWithRetry(
  opts: GenerateOptions,
  maxRetries = 2,
  maxWaitMs = 12_000,
): Promise<RetryResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries + 1} with model: ${opts.model}`);
      const result = await client.models.generateContent({
        model: opts.model,
        contents: [{ role: 'user', parts: opts.parts }],
        config: { responseMimeType: 'application/json' },
      });
      return { ok: true, result };
    } catch (error: unknown) {
      lastError = error;

      if (!isRetryableError(error) || attempt === maxRetries) {
        break;
      }

      const suggestedDelay = extractRetryDelay(error);
      const backoffMs = suggestedDelay
        ? suggestedDelay * 1000
        : Math.min(3000 * Math.pow(2, attempt), maxWaitMs); // 3s, 6s, capped

      // If the suggested wait is too long for server-side, return it to the client
      if (backoffMs > maxWaitMs) {
        console.warn(`[Retry] Suggested delay ${backoffMs}ms exceeds max ${maxWaitMs}ms — returning retryAfter to client`);
        return { ok: false, retryAfterSec: Math.ceil(backoffMs / 1000), error };
      }

      console.log(`[Retry] Waiting ${backoffMs}ms before retry...`);
      await sleep(backoffMs);
    }
  }

  throw lastError;
}

type FallbackResult =
  | { ok: true; result: any }
  | { ok: false; retryAfterSec: number; errorMessage: string };

/**
 * Try generation with primary model (with retries), then fallback model (with retries).
 * Returns { ok: true, result } on success, or { ok: false, retryAfterSec, errorMessage } when
 * all models are temporarily unavailable.
 * Throws on unrecoverable errors.
 */
export async function generateWithFallback(
  primaryModel: string,
  fallbackModel: string,
  parts: any[],
): Promise<FallbackResult> {
  // --- Primary model ---
  try {
    const primary = await generateWithRetry({ model: primaryModel, parts });
    if (primary.ok) return primary;
    // Primary said "wait too long", try fallback before returning
    console.warn(`[Fallback] Primary needs ${primary.retryAfterSec}s wait, trying fallback first`);
  } catch (primaryError: unknown) {
    console.warn(`[Fallback] Primary model (${primaryModel}) exhausted retries:`, primaryError instanceof Error ? primaryError.message : String(primaryError));
  }

  // --- Fallback model ---
  try {
    const fallback = await generateWithRetry({ model: fallbackModel, parts });
    if (fallback.ok) return fallback;
    return {
      ok: false,
      retryAfterSec: fallback.retryAfterSec,
      errorMessage: `AI models are rate-limited. Auto-retrying in ${fallback.retryAfterSec}s...`,
    };
  } catch (fallbackError: unknown) {
    console.error(`[Fallback] Fallback model (${fallbackModel}) also failed.`);

    // Extract retry delay from the last error to send to client
    const retryDelay = extractRetryDelay(fallbackError);
    const errorMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
    const is429 = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');

    if (is429 || retryDelay) {
      const delaySec = retryDelay || 60;
      return {
        ok: false,
        retryAfterSec: delaySec,
        errorMessage: `API quota temporarily exhausted. Auto-retrying in ${delaySec}s...`,
      };
    }

    throw fallbackError;
  }
}
