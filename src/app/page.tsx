'use client';

import { useEffect } from 'react';
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
  const { status, raw_context, setStatus, setQuestions, setDraftJson, setConfidence, setIsComplete, iteration_count, confidence } = useArchitectStore();

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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <Header />
      <Toaster position="bottom-right" richColors theme="dark" />
      
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {status === 'idle' ? (
            <motion.div
              key="landing"
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 sm:py-20"
            >
              <ContextInput />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="w-full md:w-1/2">
                  <Stepper currentStatus={status} />
                </div>
                <div className="w-full md:w-1/3">
                  <ConfidenceMeter confidence={confidence} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Logic Flow */}
                <div className="space-y-6">
                  {status === 'analyzing' ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md">
                      <div className="relative">
                        <Rocket className="h-12 w-12 text-blue-500 animate-pulse" />
                        <motion.div 
                          className="absolute inset-0 h-12 w-12 rounded-full border-2 border-blue-500/50"
                          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Architecting Logic...
                      </h3>
                      <p className="text-zinc-500 text-sm max-w-xs text-center">
                        Gemini is analyzing your context and identifying potential data structures.
                      </p>
                    </div>
                  ) : (
                    <RefinementEngine />
                  )}
                </div>

                {/* Right Column: Live Preview */}
                <div className="h-[75vh] lg:sticky lg:top-24">
                  <JsonPreview />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 border-t border-zinc-900 py-10 px-4 text-center">
        <p className="text-zinc-600 text-xs">
          © 2026 PromptArchitect.ai — Built with Next.js 15, Framer Motion & Google Gemini
        </p>
      </footer>
    </div>
  );
}
