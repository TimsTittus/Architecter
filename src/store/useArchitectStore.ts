import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppStatus, Question, Session, HistoryEntry } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const MAX_ITERATIONS = 4;

interface ArchitectActions {
  setRawContext: (context: string) => void;
  setStatus: (status: AppStatus) => void;
  setQuestions: (questions: Question[]) => void;
  answerQuestion: (id: string, answer: string | boolean) => void;
  setDraftJson: (json: string) => void;
  setDraftEnglish: (english: string) => void;
  setConfidence: (confidence: number) => void;
  setIsComplete: (isComplete: boolean) => void;
  addToHistory: (entry: HistoryEntry) => void;
  reset: () => void;
  incrementIteration: () => void;
}

interface ArchitectState extends Session {
  iteration_count: number;
}

type ArchitectStore = ArchitectState & ArchitectActions;

const createInitialState = (): ArchitectState => ({
  session_id: uuidv4(),
  raw_context: '',
  refined_data: {},
  questions: [],
  status: 'idle',
  history: [],
  draft_json: '',
  draft_english: '',
  is_complete: false,
  confidence: 0,
  iteration_count: 0,
});

export const useArchitectStore = create<ArchitectStore>()(
  persist(
    (set) => ({
      ...createInitialState(),

      setRawContext: (raw_context) => set({ raw_context }),
      setStatus: (status) => set({ status }),
      setQuestions: (questions) => set({ questions }),

      answerQuestion: (id, answer) =>
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === id ? { ...q, answer } : q
          )
        })),

      setDraftJson: (draft_json) => set({ draft_json }),
      setDraftEnglish: (draft_english) => set({ draft_english }),
      setConfidence: (confidence) => set({ confidence }),
      setIsComplete: (is_complete) => set({ is_complete }),

      addToHistory: (entry) =>
        set((state) => ({
          history: [...state.history, entry]
        })),

      incrementIteration: () =>
        set((state) => ({
          iteration_count: state.iteration_count + 1
        })),

      reset: () => set(createInitialState()),
    }),
    {
      name: 'prompt-architect-storage',
    }
  )
);
