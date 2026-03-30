import { NextRequest, NextResponse } from 'next/server';
import { client, PRIMARY_MODEL } from '@/lib/gemini';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `
You are a Visual Systems Architect. Your goal is to analyze both text requirements and visual context (wireframes, flowcharts, or notes) to generate a strict, high-quality JSON blueprint.

CORE CAPABILITIES:
1. VISION: Analyze uploaded images for UI components, data relationships, and logic flows.
2. STRUCTURED OUTPUT: Extract entities and map them to technical requirements.
3. CONFLICT RESOLUTION: If the image contradicts the text, generate a question to ask for clarification.

CRITICAL INSTRUCTIONS:
1. QUALITY CONTROL: Only ask CRUCIAL and CORE architectural questions.
2. Provide a 'confidence' score (0-100) based on how complete the combined context is.
3. Extract "Visual Tokens" - these are high-level entities you detected in the image (e.g., "Login Form", "5 Navigation Links", "User Dashboard Wireframe").

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
  "draft_english": "A detailed, structured natural language (English) version of the blueprint",
  "confidence": number,
  "visual_tokens": [
    {
      "id": "vt-1",
      "label": "Detected Entity Name",
      "count": number,
      "category": "ui" | "logic" | "flow" | "other"
    }
  ]
}
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
  user_input: z.string().min(1).max(4000),
  image_context: z.object({
    base64: z.string(),
    mimeType: z.string()
  }).optional(),
  iteration_count: z.number().int().min(0).max(10),
});

function parseGeminiResponse(text: string) {
  try {
    const cleanText = typeof text === 'string' ? text.replace(/```json\n?|```/g, '').trim() : '';
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('[API] Failed to parse Gemini JSON:', error);
    return {
      is_complete: false,
      missing_logic: "AI output parsing error.",
      questions: [{ id: 'error-retry', field: 'retry', question: "Parsing issue. Please try again.", type: 'text' }],
      draft_json: "{}",
      draft_english: "",
      confidence: 0,
      visual_tokens: []
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

    const { user_input, image_context, iteration_count } = validated.data;
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
        eq(usage.endpoint, '/api/analyze-multimodal')
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

    // 5. Caching (only for text context, image context might be too large for easy cache keys, or we hash it)
    const cacheKey = generateCacheKey({ sanitizedInput, image_context: !!image_context, iteration_count });
    const cachedResponse = getCache(cacheKey);
    if (cachedResponse && !image_context) { // Only cache text-only requests for now as image context is dynamic
      return NextResponse.json(cachedResponse);
    }

    const parts: any[] = [
      { text: SYSTEM_PROMPT },
      { text: `User Text Context: ${sanitizedInput}\nIteration Count: ${iteration_count}` }
    ];

    if (image_context && image_context.base64) {
      parts.push({
        inlineData: {
          data: image_context.base64,
          mimeType: image_context.mimeType
        }
      });
      parts.push({ text: "Please analyze the attached image as visual context for the requirements." });
    }

    // @ts-ignore
    const result = await client.models.generateContent({
      model: PRIMARY_MODEL,
      contents: [
        { role: 'user', parts }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.text || '';
    const parsedData = parseGeminiResponse(responseText);

    // Update Quota usage
    if (usageRecord) {
      await db.update(usage).set({ count: usageRecord.count + 1, lastRequestAt: new Date() }).where(eq(usage.id, usageRecord.id));
    } else {
      await db.insert(usage).values({
        id: crypto.randomUUID(),
        userId: userId || null,
        ipAddress: ip,
        endpoint: '/api/analyze-multimodal',
        date: today,
        count: 1,
        lastRequestAt: new Date(),
      });
    }

    // Cache the result (only for text-only)
    if (!image_context) {
      setCache(cacheKey, parsedData);
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('[API] Multimodal Error:', error);
    return NextResponse.json({
      error: 'Multimodal analysis failed',
      details: error.message
    }, { status: 500 });
  }
}