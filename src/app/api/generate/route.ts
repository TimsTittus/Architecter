import { NextRequest, NextResponse } from 'next/server';
import { PRIMARY_MODEL, FALLBACK_MODEL } from '@/lib/gemini';
import { generateWithFallback } from '@/lib/retry';

// Node.js runtime for full SDK compatibility
export const runtime = 'nodejs';

const SYSTEM_PROMPT = `
You are a Senior Data Architect. Your goal is to convert messy human ideas into strict, high-quality JSON prompts.

CRITICAL INSTRUCTIONS:
1. Analyze the user's input for ambiguity, missing constraints, or vague data structures.
2. If the context is thin, generate questions to clarify.
3. QUALITY CONTROL: Only ask CRUCIAL and CORE architectural questions. Avoid trivial, redundant, or "unwanted" questions.
4. ITERATION LOGIC:
   - As 'iteration_count' increases, your questions MUST become more focused and fewer in number (max 2-3).
   - If 'iteration_count' >= 4, you MUST set 'is_complete' to true and provide the best possible 'draft_json' based on all context gathered. Do NOT ask any more questions at this stage.
5. Provide a 'confidence' score (0-100) based on how complete the context is.

OUTPUT FORMAT (Strict JSON):
{
  "is_complete": boolean,
  "missing_logic": "Brief description of what is still unclear",
  "questions": [
    {
      "id": "unique-id",
      "field": "specific_field_name",
      "question": "The question text",
      "type": "text" | "select" | "boolean",
      "options": ["only if type is select"]
    }
  ],
  "draft_json": "Stringified JSON of the schema/prompt",
  "draft_english": "A detailed, structured natural language (English) version of the blueprint for human reading",
  "confidence": number
}

Focus on precision, architectural best practices, and minimal but high-impact interaction.
`;

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkRateLimit, validateRequest, sanitizePrompt } from '@/lib/security';
import { getCache, setCache, generateCacheKey } from '@/lib/cache';
import { db } from '@/lib/db';
import { usage, user as userTable } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const RequestSchema = z.object({
  user_input: z.string().min(1).max(16000),
  previous_responses: z.record(z.string(), z.any()).optional(),
  iteration_count: z.number().int().min(0).max(10),
});

// Helper to safely parse JSON from Gemini's response
function parseGeminiResponse(text: string) {
  try {
    const cleanText = typeof text === 'string' ? text.replace(/```json\n?|```/g, '').trim() : '';
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('[API] Failed to parse Gemini JSON:', error);
    console.log('[API] Raw output was:', text);

    return {
      is_complete: false,
      missing_logic: "AI output parsing error.",
      questions: [
        {
          id: 'error-retry',
          field: 'retry',
          question: "The architect encountered a parsing issue. Try re-submitting with slightly different wording?",
          type: 'text'
        }
      ],
      draft_json: "{}",
      draft_english: "",
      confidence: 0
    };
  }
}



export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. Identification
    const userId = session?.user.id;
    const identifier = userId || ip;
    const isGuest = !userId;

    // 2. Rate Limiting
    const rateLimit = await checkRateLimit(identifier);
    if (!rateLimit.success) {
      console.warn(`[API] Rate limit exceeded for ${identifier} (${isGuest ? 'Guest' : 'User'})`);
      return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
    }

    // 3. Validation & Sanitization
    const body = await req.json();
    const validated = validateRequest(RequestSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { user_input, previous_responses, iteration_count } = validated.data;
    const sanitizedInput = sanitizePrompt(user_input);

    // 4. Quota check
    const today = new Date().toISOString().split('T')[0];
    let quotaLimit = 100;
    if (userId) {
      const [userRecord] = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);
      quotaLimit = userRecord?.quotaLimit ?? 100;
    } else {
      quotaLimit = 10; // Guest quota
    }

    let [usageRecord] = await db.select().from(usage).where(
      and(
        userId ? eq(usage.userId, userId) : eq(usage.ipAddress, ip),
        eq(usage.date, today),
        eq(usage.endpoint, '/api/generate')
      )
    ).limit(1);

    if (usageRecord && usageRecord.count >= quotaLimit) {
      console.warn(`[API] Quota exceeded for ${identifier} (${isGuest ? 'Guest' : 'User'})`);
      return NextResponse.json({
        error: isGuest
          ? 'Daily guest quota exceeded (10/day). Please log in for up to 100 requests.'
          : 'Daily quota exceeded (100/day). Contact admin for higher limits.'
      }, { status: 403 });
    }

    // 5. Caching
    const cacheKey = generateCacheKey({ sanitizedInput, previous_responses, iteration_count });
    const cachedResponse = getCache(cacheKey);
    if (cachedResponse) {
      console.log(`[API] Cache hit for user ${userId}`);
      return NextResponse.json(cachedResponse);
    }

    let prompt = `User Input: ${sanitizedInput}\n`;
    if (previous_responses && Object.keys(previous_responses).length > 0) {
      prompt += `\n--- ALL PRIOR CLARIFICATIONS (DO NOT re-ask these) ---\n`;
      for (const [field, answer] of Object.entries(previous_responses)) {
        prompt += `  • ${field}: ${JSON.stringify(answer)}\n`;
      }
      prompt += `--- END OF PRIOR CLARIFICATIONS ---\n\n`;
      prompt += `IMPORTANT: The above fields have ALREADY been answered. Do NOT generate questions for any of these fields again. Only ask about NEW, unaddressed aspects.\n`;
    }
    prompt += `Iteration Count: ${iteration_count}\n`;
    prompt += `\nPlease analyze and provide the JSON output according to the system instructions.`;

    const parts = [{ text: SYSTEM_PROMPT + "\n\n" + prompt }];
    const genResult = await generateWithFallback(PRIMARY_MODEL, FALLBACK_MODEL, parts);

    // If models need a long wait, return retryable error to client
    if (!genResult.ok) {
      console.warn(`[API] Returning retryable error with retryAfterSec=${genResult.retryAfterSec}`);
      return NextResponse.json({
        error: genResult.errorMessage,
        retryAfterSec: genResult.retryAfterSec,
      }, { status: 503 });
    }

    const responseText = genResult.result.text || '';
    const parsedData = parseGeminiResponse(responseText);

    // SERVER-SIDE ENFORCEMENT: Force completion when max iterations reached
    const MAX_SERVER_ITERATIONS = 4;
    if (iteration_count >= MAX_SERVER_ITERATIONS && !parsedData.is_complete) {
      console.log(`[API] Forcing completion at iteration_count=${iteration_count} (max=${MAX_SERVER_ITERATIONS})`);
      parsedData.is_complete = true;
      parsedData.questions = [];
      parsedData.confidence = Math.max(parsedData.confidence || 0, 75);
      parsedData.missing_logic = parsedData.missing_logic || 'Finalized with available context.';
    }

    // Filter out questions that were already answered in previous rounds
    if (previous_responses && parsedData.questions?.length > 0) {
      const answeredFields = new Set(Object.keys(previous_responses));
      const originalCount = parsedData.questions.length;
      parsedData.questions = parsedData.questions.filter(
        (q: any) => !answeredFields.has(q.field)
      );
      if (parsedData.questions.length < originalCount) {
        console.log(`[API] Filtered ${originalCount - parsedData.questions.length} duplicate questions`);
      }
      // If all questions were duplicates, force completion
      if (parsedData.questions.length === 0 && !parsedData.is_complete) {
        console.log('[API] All questions were duplicates — forcing completion');
        parsedData.is_complete = true;
        parsedData.confidence = Math.max(parsedData.confidence || 0, 80);
      }
    }

    // Update Quota usage
    if (usageRecord) {
      await db.update(usage).set({ count: usageRecord.count + 1, lastRequestAt: new Date() }).where(eq(usage.id, usageRecord.id));
    } else {
      await db.insert(usage).values({
        id: crypto.randomUUID(),
        userId: userId || null,
        ipAddress: ip,
        endpoint: '/api/generate',
        date: today,
        count: 1,
        lastRequestAt: new Date(),
      });
    }

    // Cache the result
    setCache(cacheKey, parsedData);

    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    console.error('[API] Critical handler error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const is429or503 = errorMessage.includes('429') || errorMessage.includes('503') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('UNAVAILABLE');

    if (is429or503) {
      const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i);
      const retryAfterSec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
      return NextResponse.json({
        error: `AI service temporarily unavailable. Auto-retrying in ${retryAfterSec}s...`,
        retryAfterSec,
      }, { status: 503 });
    }

    return NextResponse.json({ error: 'Critical server error', details: errorMessage }, { status: 500 });
  }
}