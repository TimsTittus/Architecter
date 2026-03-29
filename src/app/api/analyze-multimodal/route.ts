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

function parseGeminiResponse(text: string) {
  try {
    const cleanText = text.replace(/```json\n?|```/g, '').trim();
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
    const { user_input, image_context, iteration_count } = await req.json();

    const parts: any[] = [
      { text: SYSTEM_PROMPT },
      { text: `User Text Context: ${user_input}\nIteration Count: ${iteration_count}` }
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

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('[API] Multimodal Error:', error);
    return NextResponse.json({
      error: 'Multimodal analysis failed',
      details: error.message
    }, { status: 500 });
  }
}
