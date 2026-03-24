'use client';

import { useArchitectStore } from '@/store/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const Header = () => {
  const reset = useArchitectStore((state) => state.reset);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
            PA
          </div>
          <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            PromptArchitect<span className="text-blue-400">.ai</span>
          </span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={reset}
          className="border-zinc-700 bg-zinc-900/50 text-white hover:bg-zinc-800 hover:text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>
    </header>
  );
};
