'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useArchitectStore } from '@/store/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, Zap, Target, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ContextInput = () => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const setRawContext = useArchitectStore((state) => state.setRawContext);
  const setStatus = useArchitectStore((state) => state.setStatus);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setRawContext(input);
    setStatus('analyzing');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-10"
    >
      <div className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-zinc-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Logic Architect</span>
        </div>

        <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter max-w-2xl">
          Build Your JSON <span className="text-gradient">Blueprint.</span>
        </h2>
        <p className="text-zinc-500 text-lg font-medium max-w-xl">
          Paste your requirements or messy ideas. Architect will extract the underlying logic and architect a production-ready prompt.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-white/5 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative flex flex-col gap-6 p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., I want to build a user management system with roles, permissions, and session tracking..."
            className="min-h-[300px] bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/20 resize-none text-xl font-medium leading-relaxed custom-scrollbar px-6 py-4 transition-all"
          />

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-zinc-500" />
                  </div>
                ))}
              </div>
              <span className="text-xs text-zinc-600 flex items-center font-bold uppercase tracking-tighter">
                Architecture Lab v1.0
              </span>
            </div>

            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!input.trim() || isAnalyzing}
              className="gap-3 px-8 rounded-2xl group/btn bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/5"
            >
              Analyze Logic
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Extraction", desc: "AI identifies hidden constraints", icon: Cpu },
          { title: "Clarification", desc: "Resolving ambiguity iteratively", icon: Target },
          { title: "Blueprint", desc: "Production-ready JSON output", icon: Zap }
        ].map((feat, i) => (
          <div key={i} className="flex flex-col gap-3 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white transition-colors">
              <feat.icon className="h-5 w-5 text-zinc-500 group-hover:text-black" />
            </div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider">{feat.title}</h4>
            <p className="text-zinc-500 text-xs font-semibold leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
