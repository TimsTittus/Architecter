'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useArchitectStore } from '@/store/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileJson, Check, ShieldCheck } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const JsonPreview = () => {
  const { draft_json, draft_english, is_complete } = useArchitectStore();
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'json' | 'english'>('json');

  const formattedJson = useMemo(() => {
    try {
      if (!draft_json || draft_json === '{}') return '// Awaiting architectural input...';
      const parsed = typeof draft_json === 'string' ? JSON.parse(draft_json) : draft_json;
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return typeof draft_json === 'string' ? draft_json : JSON.stringify(draft_json, null, 2);
    }
  }, [draft_json]);

  const handleCopy = useCallback(() => {
    const textToCopy = view === 'json' ? formattedJson : draft_english || 'No English blueprint available yet.';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Blueprint Copied', {
      description: view === 'json' ? 'JSON schema is ready.' : 'English blueprint is ready.'
    });
    setTimeout(() => setCopied(false), 2000);
  }, [view, formattedJson, draft_english]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "architect_blueprint.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Download Initiated');
  }, [formattedJson]);

  return (
    <div className="flex flex-col h-full rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-3xl group">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <FileJson className="h-4 w-4 md:h-5 md:w-5 text-zinc-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">
              {view === 'json' ? 'Live Blueprint' : 'Logic Flow'}
            </span>
            <span className="text-[8px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              {view === 'json' ? 'JSON Output' : 'English Overview'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
            {(['json', 'english'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                  view === v ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon-sm"
              className="h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl"
              onClick={handleCopy}
              aria-label="Copy blueprint"
            >
              {copied ? <Check className="h-3 w-3 md:h-4 md:w-4 text-white" /> : <Copy className="h-3 w-3 md:h-4 md:w-4" />}
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              className="h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl"
              onClick={handleDownload}
              aria-label="Download JSON"
            >
              <Download className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar bg-black/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={view === 'json' ? formattedJson : draft_english}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full"
          >
            {view === 'json' ? (
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
                {formattedJson}
              </SyntaxHighlighter>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {draft_english || '// Architectural overview is being drafted...'}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer / Status Label */}
      <footer className={cn(
        "px-4 md:px-6 py-3 md:py-4 flex items-center justify-between transition-colors duration-500",
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
            v1.1.0
          </span>
        )}
      </footer>
    </div>
  );
};
