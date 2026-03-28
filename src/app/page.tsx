'use client';

import { useEffect, useState } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { Header } from '@/components/Header';
import { Stepper } from '@/components/Stepper';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { ContextInput } from '@/components/ContextInput';
import { RefinementEngine } from '@/components/RefinementEngine';
import { JsonPreview } from '@/components/JsonPreview';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Rocket } from 'lucide-react';

export default function Home() {
  const {
    status,
    raw_context,
    setStatus,
    setQuestions,
    setDraftJson,
    setConfidence,
    setIsComplete,
    iteration_count,
    confidence,
    setDraftEnglish
  } = useArchitectStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initialAnalysis = async () => {
      if (status === 'analyzing' && iteration_count === 0) {
        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_input: raw_context,
              iteration_count: 0
            })
          });

          if (!response.ok) throw new Error('Failed to analyze context');

          const data = await response.json();

          setQuestions(data.questions || []);
          setDraftJson(data.draft_json || '');
          setDraftEnglish(data.draft_english || '');
          setConfidence(data.confidence || 0);
          setIsComplete(data.is_complete || false);

          if (data.is_complete) {
            setStatus('complete');
          } else {
            setStatus('questioning');
          }
        } catch (error) {
          console.error(error);
          setStatus('idle');
          toast.error('AI Analysis failed. Please check your API key and try again.');
        }
      }
    };

    initialAnalysis();
  }, [status, raw_context, iteration_count, setStatus, setQuestions, setDraftJson, setConfidence, setIsComplete]);

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-white/30 overflow-x-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <Toaster position="bottom-right" richColors={false} theme="dark" />

        <main className="flex-1 px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            {!mounted || status === 'idle' ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex items-center justify-center py-10 md:py-20"
              >
                <div className="w-full max-w-2xl">
                  <ContextInput />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 md:space-y-8"
              >
                {/* Top Stats/Progress Row */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
                  <div className="xl:col-span-2">
                    <Stepper currentStatus={status} />
                  </div>
                  <div className="h-auto">
                    <ConfidenceMeter confidence={confidence} />
                  </div>
                </div>

                {/* Main Action Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start pb-20">
                  {/* Left Column: Logic Flow (7/12) */}
                  <div className="lg:col-span-7 space-y-6">
                    {status === 'analyzing' ? (
                      <div className="flex flex-col items-center justify-center p-10 md:p-20 space-y-6 rounded-[24px] md:rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl">
                        <div className="relative">
                          <Rocket className="h-12 w-12 md:h-16 md:w-16 text-white animate-pulse" />
                          <motion.div
                            className="absolute inset-0 h-12 w-12 md:h-16 md:w-16 rounded-full border-4 border-white/50"
                            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                            Architecting Logic...
                          </h3>
                          <p className="text-zinc-500 text-xs md:text-sm max-w-xs mx-auto italic">
                            Architect is analyzing your requirements and identifying optimal data structures.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <RefinementEngine />
                    )}
                  </div>

                  {/* Right Column: Live Preview (5/12) */}
                  <div className="lg:col-span-5 min-h-[400px] lg:h-[calc(100vh-250px)] lg:sticky lg:top-8">
                    <JsonPreview />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
