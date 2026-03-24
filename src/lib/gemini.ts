import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables");
}

export const client = new GoogleGenAI({ 
  apiKey: apiKey || "" 
});

// Primary and Fallback models based on user's available model list
export const PRIMARY_MODEL = "gemini-2.5-flash";
export const FALLBACK_MODEL = "gemini-2.0-flash";

/**
 * @deprecated Use PRIMARY_MODEL instead
 */
export const modelId = PRIMARY_MODEL;
