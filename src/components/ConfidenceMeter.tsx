'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConfidenceMeterProps {
  confidence: number;
}

export const ConfidenceMeter = ({ confidence }: ConfidenceMeterProps) => {
  const getGradient = (val: number) => {
    if (val < 40) return 'from-zinc-700 to-zinc-500';
    if (val < 75) return 'from-zinc-400 to-zinc-200';
    return 'from-white to-zinc-400';
  };

  const getLabel = (val: number) => {
    if (val < 30) return 'Analyzing Sparse Input';
    if (val < 60) return 'Gaining Logical Clarity';
    if (val < 85) return 'Architectural Precision';
    return 'Execution Ready';
  };

  return (
    <div className="flex flex-col gap-4 p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl h-full justify-center">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">
            Context Status
          </span>
          <span className="text-2xl font-black text-white lining-nums">
            {confidence}%
          </span>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <div className="relative h-8 w-8">
            <svg className="h-8 w-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-white/5"
              />
              <motion.circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="88"
                initial={{ strokeDashoffset: 88 }}
                animate={{ strokeDashoffset: 88 - (88 * confidence) / 100 }}
                className="text-white"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5 border border-white/5 p-[2px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r shadow-[0_0_15px_rgba(255,255,255,0.1)]",
            getGradient(confidence)
          )}
        />
      </div>

      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
        ARCHITECTURE: <span className="text-white font-black">{getLabel(confidence)}</span>
      </p>
    </div>
  );
};
