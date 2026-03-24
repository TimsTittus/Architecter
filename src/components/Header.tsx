'use client';

import { useArchitectStore } from '@/store/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Plus, Bell } from 'lucide-react';

export const Header = () => {
  const reset = useArchitectStore((state) => state.reset);

  return (
    <header className="w-full h-24 flex items-center justify-between px-8 py-4">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          Hi Architect
        </h1>
        <p className="text-zinc-600 text-sm font-medium">
          Ready to refine some logic?
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
          <Bell className="h-5 w-5" />
        </button>

        <Button
          onClick={reset}
          className="rounded-2xl gap-2 font-bold px-6 bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5"
        >
          Take Action
          <div className="bg-black/10 p-1 rounded-lg">
            <Plus className="h-4 w-4" />
          </div>
        </Button>
      </div>
    </header>
  );
};
