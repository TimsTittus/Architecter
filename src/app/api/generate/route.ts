import { NextRequest, NextResponse } from 'next/server';
import { client, PRIMARY_MODEL, FALLBACK_MODEL } from '@/lib/gemini';

// Node.js runtime for full SDK compatibility
export const runtime = 'nodejs';

const SYSTEM_PROMPT = `
You are a Senior Data Architect. Your goal is to convert messy human ideas into strict, high-quality JSON prompts.

INSTRUCTIONS:
1. Analyze the user's input for ambiguity, missing constraints, or vague data structures.
2. If fields like 'data types', 'constraints', 'nested objects', or 'validation rules' are missing OR if the context is too thin to build a robust JSON schema, you MUST generate 3-5 high-impact questions to clarify.
3. If the input is sufficient, mark 'is_complete' as true and provide the final JSON structure in 'draft_json'.
4. 'draft_json' should always contain the best possible JSON representation of the user's intent so far.
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
  "confidence": number
}

Focus on precision and architectural best practices.
`;

// Helper to safely parse JSON from Gemini's response
function parseGeminiResponse(text: string) {
  try {
    const cleanText = text.replace(/```json\n?|```/g, '').trim();
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
      confidence: 0
    };
  }
}

async function attemptGeneration(model: string, prompt: string) {
  console.log(`[API] Attempting generation with model: ${model}`);
  return await client.models.generateContent({
    model,
    contents: [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }
    ],
    config: {
      responseMimeType: "application/json",
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const { user_input, previous_responses, iteration_count } = await req.json();

    let prompt = `User Input: ${user_input}\n`;
    if (previous_responses && Object.keys(previous_responses).length > 0) {
      prompt += `Previous Clarifications: ${JSON.stringify(previous_responses)}\n`;
    }
    prompt += `Iteration Count: ${iteration_count}\n`;
    prompt += `\nPlease analyze and provide the JSON output according to the system instructions.`;

    let result;
    try {
      // Primary Attempt
      result = await attemptGeneration(PRIMARY_MODEL, prompt);
    } catch (primaryError: any) {
      console.warn(`[API] Primary model (${PRIMARY_MODEL}) failed:`, primaryError.message);
      
      // Fallback Attempt
      try {
        result = await attemptGeneration(FALLBACK_MODEL, prompt);
        console.log(`[API] Successfully fell back to ${FALLBACK_MODEL}`);
      } catch (fallbackError: any) {
        console.error('[API] Both primary and fallback models failed.');
        
        const isQuota = fallbackError.status === 429 || fallbackError.message?.includes('429');
        
        return NextResponse.json({
          is_complete: false,
          missing_logic: "API Connection Error.",
          questions: [
            {
              id: 'api-error',
              field: 'error',
              question: isQuota 
                ? "API quota exhausted. Please wait a minute before retrying."
                : "The architect service is currently unavailable. Please verify your GEMINI_API_KEY.",
              type: 'text'
            }
          ],
          draft_json: "{}",
          confidence: 0
        });
      }
    }

    const responseText = result.text || '';
    const parsedData = parseGeminiResponse(responseText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('[API] Critical handler error:', error);
    return NextResponse.json({ error: 'Critical server error', details: error.message }, { status: 500 });
  }
}
