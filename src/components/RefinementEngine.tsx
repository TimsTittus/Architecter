'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useArchitectStore } from '@/store/useArchitectStore';
import { QuestionCard } from './QuestionCard';
import { Button } from '@/components/ui/button';
import { Send, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

export const RefinementEngine = () => {
  const {
    questions,
    answerQuestion,
    status,
    setStatus,
    raw_context,
    iteration_count,
    incrementIteration,
    setQuestions,
    setDraftJson,
    setConfidence,
    setIsComplete
  } = useArchitectStore();

  const handleAnswer = (id: string, answer: string | boolean) => {
    answerQuestion(id, answer);
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => q.answer === undefined || q.answer === '');
    if (unanswered.length > 0) {
      toast.error('Contextual Gap Detected', {
        description: `Please clarify: ${unanswered.map(q => q.field).join(', ')}`
      });
      return;
    }

    setStatus('analyzing');
    incrementIteration();

    try {
      const answers: Record<string, any> = {};
      questions.forEach(q => {
        answers[q.field] = q.answer;
      });

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: raw_context,
          previous_responses: answers,
          iteration_count: iteration_count + 1
        })
      });

      if (!response.ok) throw new Error('API Fault');

      const data = await response.json();

      setQuestions(data.questions || []);
      setDraftJson(data.draft_json || '');
      setConfidence(data.confidence || 0);
      setIsComplete(data.is_complete || false);

      if (data.is_complete) {
        setStatus('complete');
        toast.success('Architecture Locked', {
          description: 'Blueprint is now production-ready.'
        });
      } else {
        setStatus('questioning');
        toast.info(`Iteration ${iteration_count + 1}`, {
          description: `Architect is seeking deeper clarity on specific modules.`
        });
      }
    } catch (error) {
      console.error(error);
      setStatus('questioning');
      toast.error('Logical Fault', {
        description: 'Unable to process updates. Please retry.'
      });
    }
  };

  const MAX_ITERATIONS = 4;
  const currentRound = iteration_count + 1;
  const totalRounds = MAX_ITERATIONS + 1;
  const roundsLeft = Math.max(0, totalRounds - currentRound);

  return (
    <div className="flex flex-col gap-6 md:gap-8 h-full">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
            Logic Refinement
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest">
              Rounds Left:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white text-[10px] font-black">
              {roundsLeft}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest">
            Iteration Sequence:
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white text-[10px] font-black underline decoration-white/50 underline-offset-4">
            Round {currentRound} of {totalRounds}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 md:pr-4 custom-scrollbar min-h-0">
        <AnimatePresence mode="popLayout">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onAnswer={handleAnswer}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="pt-4 border-t border-white/5">
        <Button
          className="w-full gap-3 font-black text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-2xl h-12 md:h-14 bg-white text-black hover:bg-white/90"
          onClick={handleSubmit}
          disabled={status === 'analyzing'}
        >
          {status === 'analyzing' ? (
            <RefreshCcw className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Push Architectural Updates
        </Button>
      </div>
    </div>
  );
};
