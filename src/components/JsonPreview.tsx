'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useArchitectStore } from '@/store/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileJson, Check, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const JsonPreview = () => {
  const { draft_json, is_complete } = useArchitectStore();
  const [copied, setCopied] = useState(false);

  const formattedJson = () => {
    try {
      if (!draft_json || draft_json === '{}') return '// Awaiting architectural input...';
      const parsed = typeof draft_json === 'string' ? JSON.parse(draft_json) : draft_json;
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return draft_json;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson());
    setCopied(true);
    toast.success('Blueprint Copied', {
      description: 'JSON schema is ready for your LLM context.'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([formattedJson()], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = "architect_blueprint.json";
    document.body.appendChild(element);
    element.click();
    toast.success('Download Initiated');
  };

  return (
    <div className="flex flex-col h-full rounded-[32px] bg-white/5 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-3xl group">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <FileJson className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-white">Live Blueprint</span>
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">JSON Output</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-xl"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-xl"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-black/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={formattedJson()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full"
          >
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{
                background: 'transparent',
                padding: 0,
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.7',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {formattedJson()}
            </SyntaxHighlighter>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Status Label */}
      <div className={cn(
        "px-6 py-4 flex items-center justify-between transition-colors duration-500",
        is_complete ? "bg-white/10" : "bg-white/5"
      )}>
        <div className="flex items-center gap-2">
          {is_complete ? (
            <ShieldCheck className="h-4 w-4 text-white" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
          )}
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            is_complete ? "text-white" : "text-zinc-600"
          )}>
            {is_complete ? "Architecture Certified" : "Syncing Logic Modules..."}
          </span>
        </div>

        {is_complete && (
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            v1.0.0
          </span>
        )}
      </div>
    </div>
  );
};
