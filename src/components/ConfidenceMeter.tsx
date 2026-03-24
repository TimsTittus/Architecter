'use client';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface ConfidenceMeterProps {
  confidence: number;
}

export const ConfidenceMeter = ({ confidence }: ConfidenceMeterProps) => {
  const getColor = (val: number) => {
    if (val < 40) return 'rgba(239, 68, 68, 0.5)'; // red-500/50
    if (val < 75) return 'rgba(245, 158, 11, 0.5)'; // amber-500/50
    return 'rgba(34, 197, 94, 0.5)'; // green-500/50
  };

  const getLabel = (val: number) => {
    if (val < 30) return 'Sparse Context';
    if (val < 60) return 'Gaining Clarity';
    if (val < 85) return 'Highly Accurate';
    return 'Architect Approved';
  };

  return (
    <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-400">Context Completeness</span>
        <span className="text-xs font-bold text-zinc-300">{confidence}%</span>
      </div>
      
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ backgroundColor: getColor(confidence) }}
          className="h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
        />
      </div>
      
      <p className="text-center text-[10px] uppercase tracking-widest text-zinc-500">
        Status: <span className="text-zinc-300">{getLabel(confidence)}</span>
      </p>
    </div>
  );
};
