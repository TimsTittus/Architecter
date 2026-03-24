'use client';

import { motion } from 'framer-motion';
import { Question } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onAnswer: (id: string, answer: string) => void;
}

export const QuestionCard = ({ question, onAnswer }: QuestionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-sm shadow-xl hover:border-zinc-700 transition-colors">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-3">
            <div className="mt-1 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500/70">
                Field: {question.field}
              </span>
              <p className="text-zinc-200 text-lg font-medium leading-tight">
                {question.question}
              </p>
            </div>
          </div>

          <div className="mt-4">
            {question.type === 'text' && (
              <Input
                placeholder="Enter your response..."
                className="bg-black/40 border-zinc-700 text-white focus:ring-blue-500/50 h-11"
                onChange={(e) => onAnswer(question.id, e.target.value)}
              />
            )}
            
            {question.type === 'select' && (
              <div className="grid grid-cols-2 gap-2">
                {question.options?.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className={`justify-start bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 ${
                      question.answer === option ? 'border-blue-500 text-blue-400 bg-blue-500/10' : ''
                    }`}
                    onClick={() => onAnswer(question.id, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}

            {question.type === 'boolean' && (
              <div className="flex gap-2">
                {['Yes', 'No'].map((opt) => (
                  <Button
                    key={opt}
                    variant="outline"
                    className={`flex-1 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 ${
                      (opt === 'Yes' && question.answer === true) || (opt === 'No' && question.answer === false)
                        ? 'border-blue-500 text-blue-400 bg-blue-500/10' : ''
                    }`}
                    onClick={() => onAnswer(question.id, opt === 'Yes' ? 'true' : 'false')}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
