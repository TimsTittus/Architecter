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

export interface Session {
  session_id: string;
  raw_context: string;
  refined_data: Record<string, any>;
  questions: Question[];
  status: AppStatus;
  history: any[];
  draft_json: string;
  is_complete: boolean;
  confidence: number;
}

export interface GenerateRequest {
  user_input: string;
  previous_responses?: any;
  iteration_count: number;
}

export interface GenerateResponse {
  is_complete: boolean;
  missing_logic: string;
  questions: Question[];
  draft_json: string;
  confidence: number;
}
