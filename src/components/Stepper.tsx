'use client';

import { motion } from 'framer-motion';
import { Check, ClipboardList, HelpCircle, Rocket, Type } from 'lucide-react';
import { AppStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StepperProps {
  currentStatus: AppStatus;
}

const steps = [
  { id: 'idle', label: 'Input', icon: Type },
  { id: 'analyzing', label: 'Logic Flow', icon: Rocket },
  { id: 'questioning', label: 'Clarifying', icon: HelpCircle },
  { id: 'complete', label: 'Ready', icon: Check },
];

export const Stepper = ({ currentStatus }: StepperProps) => {
  const currentIndex = steps.findIndex(s => s.id === currentStatus);
  const activeIndex = currentIndex === -1 ? 1 : currentIndex;

  return (
    <div className="flex w-full items-center p-4 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
      {/* Background Rail */}
      <div className="absolute left-[8%] right-[8%] top-1/2 -translate-y-1/2 h-[1px] md:h-[2px] bg-white/5" />

      {/* Active Rail Overlay */}
      <motion.div
        initial={false}
        animate={{
          width: `${(activeIndex / (steps.length - 1)) * 84}%`
        }}
        className="absolute left-[8%] top-1/2 -translate-y-1/2 h-[1px] md:h-[2px] bg-gradient-to-r from-white to-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
      />

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <div key={step.id} className="relative flex flex-1 flex-col items-center">
            {/* Step Node */}
            <motion.div
              initial={false}
              animate={{
                background: isCurrent
                  ? 'white'
                  : isActive
                    ? 'rgba(255,255,255,0.15)'
                    : 'transparent',
                borderColor: isActive ? 'white' : 'rgba(255,255,255,0.1)',
                scale: isCurrent ? 1.1 : 1,
              }}
              className={cn(
                "relative z-10 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl border backdrop-blur-md transition-all duration-500",
                isActive ? "shadow-[0_0_20px_rgba(255,255,255,0.1)]" : ""
              )}
            >
              {isActive && index < activeIndex ? (
                <Check className={cn("h-5 w-5 md:h-6 md:w-6 text-black")} />
              ) : (
                <Icon className={cn(
                  "h-4 w-4 md:h-5 md:w-5 transition-colors duration-500",
                  isCurrent ? "text-black" : isActive ? "text-white" : "text-zinc-600"
                )} />
              )}

              {/* Pulse effect for current step */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-xl md:rounded-2xl border-2 border-white"
                  animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </motion.div>

            <span className={cn(
              "mt-2 md:mt-3 text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-colors duration-500 text-center",
              isActive ? "text-white" : "text-zinc-700"
            )}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
