import { NextRequest, NextResponse } from 'next/server';
import { client, PRIMARY_MODEL, FALLBACK_MODEL } from '@/lib/gemini';

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
      draft_english: "",
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
    } catch (primaryError: unknown) {
      console.warn(`[API] Primary model (${PRIMARY_MODEL}) failed:`, primaryError instanceof Error ? primaryError.message : String(primaryError));
      
      // Fallback Attempt
      try {
        result = await attemptGeneration(FALLBACK_MODEL, prompt);
        console.log(`[API] Successfully fell back to ${FALLBACK_MODEL}`);
      } catch (fallbackError: unknown) {
        console.error('[API] Both primary and fallback models failed.');
        
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        const isQuota = errorMessage.includes('429');
        
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
          draft_english: "",
          confidence: 0
        });
      }
    }

    const responseText = result.text || '';
    const parsedData = parseGeminiResponse(responseText);

    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    console.error('[API] Critical handler error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Critical server error', details: errorMessage }, { status: 500 });
  }
}
