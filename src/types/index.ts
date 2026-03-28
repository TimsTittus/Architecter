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
}

export interface GenerateRequest {
  user_input: string;
  previous_responses?: Record<string, string | boolean>;
  iteration_count: number;
}

export interface GenerateResponse {
  is_complete: boolean;
  missing_logic: string;
  questions: Question[];
  draft_json: string;
  confidence: number;
}
