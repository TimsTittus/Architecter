'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useArchitectStore } from '@/store/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, Zap, Target, Cpu, Layout, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageDropzone } from './ImageDropzone';

export const SmartContextUploader = () => {
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setRawContext = useArchitectStore((state) => state.setRawContext);
  const setImageContext = useArchitectStore((state) => state.setImageContext);
  const setStatus = useArchitectStore((state) => state.setStatus);
  const imageContext = useArchitectStore((state) => state.image_context);

  const handleAnalyze = async () => {
    if (!input.trim() && !imageContext) return;
    setRawContext(input);
    setStatus('analyzing');
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-10"
    >
      <div className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-zinc-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Multimodal Architect v1.1</span>
        </div>

        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tighter max-w-3xl">
          Architect with <span className="text-gradient">Vision.</span>
        </h2>
        <p className="text-zinc-500 text-base md:text-lg font-medium max-w-2xl">
          Describe your logic or upload wireframes. Our visual engine will extract structural entities and data relationships automatically.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-white/5 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative flex flex-col gap-6 p-4 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left Column: Text Context */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <Layout className="h-4 w-4 text-zinc-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Logical Requirements</span>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your system, data flows, and constraints..."
                className="min-h-[200px] md:min-h-[300px] bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/20 resize-none text-lg font-medium leading-relaxed custom-scrollbar px-6 py-4 transition-all"
              />
            </div>

            {/* Right Column: Visual Context */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <ImageIcon className="h-4 w-4 text-zinc-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Visual Blueprint</span>
              </div>
              <ImageDropzone
                onImageUpload={setImageContext}
                className="h-full min-h-[300px]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
            <div className="flex gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-6 md:h-8 md:w-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center">
                    <Zap className="h-3 w-3 md:h-4 md:w-4 text-zinc-500" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
                  Vision Engine Active
                </span>
                <span className="text-[8px] text-zinc-700 font-medium">Gemini 1.5 Flash Enabled</span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={(!input.trim() && !imageContext)}
              className="w-full sm:w-auto gap-3 px-10 rounded-2xl group/btn bg-white text-black hover:bg-white/90 shadow-2xl shadow-primary/20 h-14"
            >
              Analyze Multimodal
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Visual Extraction", desc: "OCR and spatial analysis of wireframes", icon: Layout },
          { title: "Logical Sync", desc: "Merging text prompts with visual data", icon: Cpu },
          { title: "Smart Schema", desc: "Generates production-ready JSON", icon: Zap }
        ].map((feat, i) => (
          <div key={i} className="flex flex-col gap-4 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white transition-colors">
              <feat.icon className="h-6 w-6 text-zinc-500 group-hover:text-black" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-black text-sm uppercase tracking-wider">{feat.title}</h4>
              <p className="text-zinc-500 text-xs font-semibold leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
