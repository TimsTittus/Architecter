'use client';

import { useEffect, useState, useMemo } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { Header } from '@/components/Header';
import { Stepper } from '@/components/Stepper';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { SmartContextUploader } from '@/components/SmartContextUploader';
import { RefinementEngine } from '@/components/RefinementEngine';
import { JsonPreview } from '@/components/JsonPreview';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { Rocket } from 'lucide-react';
import { useInitialAnalysis } from '@/hooks/useInitialAnalysis';

export default function Home() {
  const { status, confidence, image_context } = useArchitectStore();
  const [mounted, setMounted] = useState(false);

  // Initialize analysis flow
  useInitialAnalysis();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isIdle = !mounted || status === 'idle';
  const isAnalyzing = status === 'analyzing';

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-white/30 overflow-x-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <Toaster position="bottom-right" richColors={false} theme="dark" />

        <main className="flex-1 px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            {isIdle ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex items-center justify-center py-10 md:py-20"
              >
                <div className="w-full max-w-4xl mx-auto">
                  <SmartContextUploader />
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
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center p-10 md:p-20 space-y-6 rounded-[24px] md:rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl">
                        <div className="relative">
                          <Rocket className="h-12 w-12 md:h-16 md:w-16 text-white animate-pulse" />
                          <motion.div
                            className="absolute inset-0 h-12 w-12 md:h-16 md:w-16 rounded-full border-4 border-white/50"
                            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                        </div>
                        <div className="text-center space-y-4">
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                            {image_context ? 'Multimodal Architecting...' : 'Architecting Logic...'}
                          </h3>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-center gap-3">
                              <div className="h-1 w-12 rounded-full bg-white/20 overflow-hidden">
                                <motion.div
                                  className="h-full bg-white"
                                  animate={{ x: [-48, 48] }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                />
                              </div>
                              <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                                Parsing Text Logic
                              </span>
                            </div>
                            {image_context && (
                              <div className="flex items-center justify-center gap-3">
                                <div className="h-1 w-12 rounded-full bg-white/20 overflow-hidden">
                                  <motion.div
                                    className="h-full bg-blue-500"
                                    animate={{ x: [-48, 48] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                                  />
                                </div>
                                <span className="text-blue-500/80 text-[10px] uppercase tracking-widest font-bold">
                                  Scanning Visual Context
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-zinc-500 text-xs md:text-sm max-w-xs mx-auto italic pt-2">
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
