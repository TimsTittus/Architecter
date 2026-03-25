'use client';

import { motion } from 'framer-motion';
import { Question } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  onAnswer: (id: string, answer: string | boolean) => void;
}

export const QuestionCard = ({ question, onAnswer }: QuestionCardProps) => {
  const isAnswered = question.answer !== undefined && question.answer !== '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative p-4 md:p-6 rounded-[24px] md:rounded-3xl bg-white/5 border transition-all duration-500 overflow-hidden group",
        isAnswered ? "border-white/40 bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]" : "border-white/5 hover:border-white/10"
      )}
    >
      {/* Visual Indicator of completion */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4"
        >
          <CheckCircle2 className="h-5 w-5 text-white" />
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-zinc-500">
            Context Node: {question.field}
          </span>
          <h4 className="text-base md:text-lg font-bold text-white leading-snug pr-8">
            {question.question}
          </h4>
        </div>

        <div className="flex flex-col gap-3">
          {question.type === 'text' && (
            <Input
              placeholder="Architectural spec..."
              className="bg-black/20 border-white/5 text-white h-10 md:h-12 rounded-xl focus:ring-white/20 text-sm md:text-base px-3 md:px-4"
              onChange={(e) => onAnswer(question.id, e.target.value)}
              value={typeof question.answer === 'string' ? question.answer : ''}
            />
          )}

          {question.type === 'select' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {question.options?.map((option) => (
                <Button
                  key={option}
                  variant={question.answer === option ? "default" : "secondary"}
                  className="rounded-xl h-auto min-h-9 md:min-h-10 text-[9px] md:text-[10px] uppercase font-black tracking-widest px-4 py-2 text-wrap text-center"
                  onClick={() => onAnswer(question.id, option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {question.type === 'boolean' && (
            <div className="flex gap-2">
              {[
                { label: 'Integrate', val: true },
                { label: 'Exclude', val: false }
              ].map((opt) => (
                <Button
                  key={String(opt.val)}
                  variant={question.answer === opt.val ? "default" : "secondary"}
                  className="flex-1 rounded-xl h-9 md:h-10 text-[9px] md:text-[10px] uppercase font-black tracking-widest"
                  onClick={() => onAnswer(question.id, opt.val)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
