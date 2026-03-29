'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useArchitectStore, MAX_ITERATIONS } from '@/store/useArchitectStore';
import { QuestionCard } from './QuestionCard';
import { Button } from '@/components/ui/button';
import { Send, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

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
    setDraftEnglish,
    setConfidence,
    setIsComplete,
    visual_tokens,
    setVisualTokens
  } = useArchitectStore();

  const handleAnswer = useCallback((id: string, answer: string | boolean) => {
    answerQuestion(id, answer);
  }, [answerQuestion]);

  const handleSubmit = useCallback(async () => {
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
      const answers = questions.reduce((acc, q) => {
        if (q.answer !== undefined) acc[q.field] = q.answer;
        return acc;
      }, {} as Record<string, string | boolean>);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: raw_context,
          previous_responses: answers,
          iteration_count: iteration_count + 1
        })
      });

      if (!response.ok) throw new Error('API Fault: Unable to reach architect services.');

      const data = await response.json();

      setQuestions(data.questions || []);
      setDraftJson(data.draft_json || '');
      setDraftEnglish(data.draft_english || '');
      setConfidence(data.confidence || 0);
      setIsComplete(data.is_complete || false);
      setVisualTokens(data.visual_tokens || []);

      if (data.is_complete) {
        setStatus('complete');
        toast.success('Architecture Locked', {
          description: 'Blueprint is now production-ready.'
        });

        // Background save to history
        fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawInput: raw_context,
            finalPrompt: data.draft_json,
            draftJson: data.draft_json,
            confidence: data.confidence,
            iterationCount: iteration_count + 1
          })
        }).catch(err => console.error('History save failed:', err));

      } else {
        setStatus('questioning');
        toast.info(`Iteration ${iteration_count + 1} Complete`, {
          description: `Architect is seeking deeper clarity on specific modules.`
        });
      }
    } catch (error: unknown) {
      console.error('Submission Error:', error);
      setStatus('questioning');
      toast.error('Logical Fault', {
        description: error instanceof Error ? error.message : 'Unable to process updates. Please retry.'
      });
    }
  }, [questions, raw_context, iteration_count, setStatus, incrementIteration, setQuestions, setDraftJson, setDraftEnglish, setConfidence, setIsComplete]);

  const currentRound = iteration_count + 1;
  const totalRounds = MAX_ITERATIONS + 1;
  const roundsLeft = useMemo(() => Math.max(0, totalRounds - currentRound), [totalRounds, currentRound]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 h-full">
      <header className="flex flex-col gap-3">
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

        {/* Visual Tokens Display */}
        {visual_tokens && visual_tokens.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {visual_tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default"
              >
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  token.category === 'ui' ? "bg-blue-400" :
                    token.category === 'logic' ? "bg-purple-400" :
                      token.category === 'flow' ? "bg-green-400" : "bg-zinc-400"
                )} />
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">
                  {token.label}
                  {token.count > 1 && <span className="ml-1 opacity-50">x{token.count}</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </header>

      <section className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 md:pr-4 custom-scrollbar min-h-0">
        <AnimatePresence mode="popLayout" initial={false}>
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onAnswer={handleAnswer}
            />
          ))}
        </AnimatePresence>
      </section>

      <footer className="pt-4 border-t border-white/5">
        <Button
          className="w-full gap-3 font-black text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-2xl h-12 md:h-14 bg-white text-black hover:bg-white/90 disabled:opacity-50 transition-all"
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
      </footer>
    </div>
  );
};
