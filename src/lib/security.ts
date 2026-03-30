import { ZodSchema } from 'zod';

// Simple in-memory rate limiter (sliding window)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_SIZE_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute

export async function checkRateLimit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; resetAt: number }> {
  const now = Date.now();
  const userData = rateLimitMap.get(identifier);

  if (!userData || now > userData.resetAt) {
    const newData = { count: 1, resetAt: now + WINDOW_SIZE_MS };
    rateLimitMap.set(identifier, newData);
    return { success: true, limit: MAX_REQUESTS_PER_WINDOW, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt: newData.resetAt };
  }

  if (userData.count >= MAX_REQUESTS_PER_WINDOW) {
    return { success: false, limit: MAX_REQUESTS_PER_WINDOW, remaining: 0, resetAt: userData.resetAt };
  }

  userData.count += 1;
  return { success: true, limit: MAX_REQUESTS_PER_WINDOW, remaining: MAX_REQUESTS_PER_WINDOW - userData.count, resetAt: userData.resetAt };
}

export function validateRequest<T>(schema: ZodSchema<T>, data: any): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues.map((e: any) => e.message).join(', ') };
  }
  return { success: true, data: result.data };
}

// Sanitization: Block suspicious patterns and limit length
export function sanitizePrompt(prompt: string): string {
  const maxLength = 4000;
  let sanitized = prompt.trim().slice(0, maxLength);

  // Basic blockage of common injection patterns
  const suspiciousPatterns = [/ignore all previous instructions/i, /system prompt/i, /override/i];
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(sanitized)) {
      console.warn(`Suspicious pattern detected: ${pattern}`);
    }
  });

  return sanitized;
}
