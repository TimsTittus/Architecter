'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, FileJson, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PromptHistory {
  id: string;
  rawInput: string;
  finalPrompt: string;
  draftJson: string;
  confidence: number;
  createdAt: string;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar = ({ isOpen, onClose }: HistorySidebarProps) => {
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHistory(history.filter(h => h.id !== id));
        toast.success('History removed');
      }
    } catch (error) {
      toast.error('Failed to delete history');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-white/10 z-[101] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-zinc-400" />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Prompt History</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white/20 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                  <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5">
                    <FileJson className="h-8 w-8 text-zinc-700" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-white font-bold">No history found</p>
                    <p className="text-zinc-600 text-xs">Generated prompts will appear here.</p>
                  </div>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        <p className="text-xs text-white font-medium line-clamp-2">
                          {item.rawInput}
                        </p>
                      </div>
                      <button 
                        onClick={() => deleteEntry(item.id)}
                        className="p-2 rounded-lg bg-zinc-900 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-zinc-400 font-black uppercase">
                                Confidence: {item.confidence}%
                            </div>
                        </div>
                        <Button size="sm" variant="secondary" className="h-7 px-3 text-[10px] font-bold rounded-lg bg-white text-black hover:bg-white/90">
                            Apply Blueprint <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
