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

  const handleAnswer = (id: string, answer: string) => {
    // Convert boolean strings to actual booleans
    const finalAnswer = answer === 'true' ? true : answer === 'false' ? false : answer;
    answerQuestion(id, finalAnswer);
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = questions.filter(q => q.answer === undefined || q.answer === '');
    if (unanswered.length > 0) {
      toast.error('Please answer all questions before proceeding.', {
        description: `Missing answers for: ${unanswered.map(q => q.field).join(', ')}`
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

      if (!response.ok) throw new Error('Failed to generate context');

      const data = await response.json();
      
      setQuestions(data.questions || []);
      setDraftJson(data.draft_json || '');
      setConfidence(data.confidence || 0);
      setIsComplete(data.is_complete || false);
      
      if (data.is_complete) {
        setStatus('complete');
        toast.success('Architecture Finalized!', {
          description: 'Your JSON structure is ready for export.'
        });
      } else {
        setStatus('questioning');
        toast.info('More Clarity Needed', {
          description: `Iteration ${iteration_count + 1}: AI has generated follow-up questions.`
        });
      }
    } catch (error) {
      console.error(error);
      setStatus('questioning');
      toast.error('Analysis failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Refinement Engine</h3>
          <p className="text-zinc-500 text-sm italic">Iteration #{iteration_count + 1}</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
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

      <div className="pt-4">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 shadow-lg shadow-blue-500/20"
          onClick={handleSubmit}
          disabled={status === 'analyzing'}
        >
          {status === 'analyzing' ? (
            <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Send className="mr-2 h-5 w-5" />
          )}
          Submit Context Updates
        </Button>
      </div>
    </div>
  );
};
