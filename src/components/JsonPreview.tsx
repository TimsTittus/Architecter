'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useArchitectStore } from '@/store/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileJson, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const JsonPreview = () => {
  const { draft_json, is_complete } = useArchitectStore();
  const [copied, setCopied] = useState(false);

  const formattedJson = () => {
    try {
      if (!draft_json) return '// Waiting for AI analysis...';
      const parsed = typeof draft_json === 'string' ? JSON.parse(draft_json) : draft_json;
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return draft_json;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson());
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([formattedJson()], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = "prompt_schema.json";
    document.body.appendChild(element);
    element.click();
    toast.success('Download started');
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-2xl overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold text-zinc-300">Live JSON Preview</span>
          {is_complete && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 font-bold uppercase tracking-wider">
              Ready
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-zinc-400 hover:text-white"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-zinc-400 hover:text-white"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          customStyle={{
            background: 'transparent',
            padding: 0,
            margin: 0,
            fontSize: '13px',
            lineHeight: '1.6',
          }}
        >
          {formattedJson()}
        </SyntaxHighlighter>
      </div>
      
      {!is_complete && draft_json && (
        <div className="p-3 bg-blue-500/5 border-t border-blue-500/10">
          <p className="text-[11px] text-blue-400/70 text-center italic">
            Draft structure — awaiting further clarification for final schema.
          </p>
        </div>
      )}
    </div>
  );
};
