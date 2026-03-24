'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useArchitectStore } from '@/store/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export const ContextInput = () => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const setRawContext = useArchitectStore((state) => state.setRawContext);
  const setStatus = useArchitectStore((state) => state.setStatus);
  const incrementIteration = useArchitectStore((state) => state.incrementIteration);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setRawContext(input);
    setStatus('analyzing');
    // Actual API call will be triggered by a useEffect in the main page or store
    // This is just a UI transition for now
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="text-blue-400 h-6 w-6" />
              Build Your JSON Blueprint
            </h2>
            <p className="text-zinc-400 text-lg">
              Paste your messy ideas, requirements, or documentation below. 
              Our AI will extract the logic and ask questions to build a perfect JSON prompt.
            </p>
          </div>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., I want to build a CRM for real estate agents. It needs to track leads, properties, and interactions. Leads should have status like 'warm' or 'cold'. Properties should include address and price..."
            className="min-h-[250px] bg-black/40 border-zinc-700 text-white placeholder:text-zinc-600 focus:ring-blue-500/50 resize-y text-lg"
          />

          <div className="flex justify-end pt-4">
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!input.trim() || isAnalyzing}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold h-12 px-8 shadow-lg shadow-blue-500/20"
            >
              Analyze Context
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {[
          { title: "Recursive Feedback", desc: "AI asks clarifying questions until the logic is watertight." },
          { title: "Dynamic Schemas", desc: "Generates complex nested JSON prompts automatically." },
          { title: "Instant Export", desc: "Download as file or copy directly to your LLM system prompt." }
        ].map((feat, i) => (
          <div key={i} className="p-4 rounded-lg bg-zinc-900/20 border border-zinc-800/50">
            <h4 className="text-blue-400 font-semibold mb-1">{feat.title}</h4>
            <p className="text-zinc-500 text-sm">{feat.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
