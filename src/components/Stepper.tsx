'use client';

import { motion } from 'framer-motion';
import { Check, ClipboardList, HelpCircle, Rocket, Type } from 'lucide-react';
import { AppStatus } from '@/types';

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
  const activeIndex = currentIndex === -1 ? 1 : currentIndex; // handle analyzing/finalizing

  return (
    <div className="flex w-full items-center justify-between px-2 py-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <div key={step.id} className="relative flex flex-1 flex-col items-center">
            {/* Connector Line */}
            {index !== 0 && (
              <div 
                className={`absolute left-[-50%] top-5 h-[2px] w-full transition-colors duration-500 ${
                  isActive ? 'bg-blue-500' : 'bg-zinc-800'
                }`} 
              />
            )}
            
            {/* Step Circle */}
            <motion.div
              initial={false}
              animate={{
                scale: isCurrent ? 1.2 : 1,
                backgroundColor: isCurrent ? '#3b82f6' : isActive ? '#2563eb' : '#27272a',
              }}
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                isCurrent ? 'border-blue-300' : isActive ? 'border-blue-600' : 'border-zinc-700'
              } text-white shadow-xl`}
            >
              {isActive && index < activeIndex ? (
                <Check className="h-5 w-5" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </motion.div>
            
            <span className={`mt-2 text-xs font-medium uppercase tracking-wider ${
              isActive ? 'text-blue-400' : 'text-zinc-500'
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
