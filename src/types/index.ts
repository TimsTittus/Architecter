export type QuestionType = 'text' | 'select' | 'boolean';

export interface Question {
  id: string;
  field: string;
  question: string;
  type: QuestionType;
  options?: string[];
  answer?: string | boolean;
}

export type AppStatus = 'idle' | 'analyzing' | 'questioning' | 'finalizing' | 'complete';

export interface HistoryEntry {
  timestamp: number;
  input: string;
  output: string;
  confidence: number;
}

export interface Session {
  session_id: string;
  raw_context: string;
  refined_data: Record<string, unknown>;
  questions: Question[];
  status: AppStatus;
  history: HistoryEntry[];
  draft_json: string;
  draft_english: string;
  is_complete: boolean;
  confidence: number;
  image_context: {
    base64: string | null;
    mimeType: string | null;
    fileName: string | null;
  } | null;
  visual_tokens: VisualToken[];
}

export interface GenerateRequest {
  user_input: string;
  previous_responses?: Record<string, string | boolean>;
  iteration_count: number;
  image_context?: {
    base64: string;
    mimeType: string;
  } | null;
}

export interface GenerateResponse {
  is_complete: boolean;
  missing_logic: string;
  questions: Question[];
  draft_json: string;
  confidence: number;
  visual_tokens?: VisualToken[];
}

export interface VisualToken {
  id: string;
  label: string;
  count: number;
  category: 'ui' | 'logic' | 'flow' | 'other';
}
