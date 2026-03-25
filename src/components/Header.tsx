'use client';

import { useArchitectStore } from '@/store/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Plus, Bell } from 'lucide-react';

export const Header = () => {
  const reset = useArchitectStore((state) => state.reset);

  return (
    <header className="w-full h-20 md:h-24 flex items-center justify-between px-4 md:px-8 py-4">
      <div className="flex flex-col">
        <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          Hi Architect
        </h1>
        <p className="hidden md:block text-zinc-600 text-sm font-medium">
          Ready to refine some logic?
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-4">


        <Button
          onClick={reset}
          className="rounded-xl md:rounded-2xl gap-2 font-bold px-4 md:px-6 bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5 text-xs md:text-sm h-9 md:h-11"
        >
          <span className="hidden sm:inline">Take Action</span>
          <span className="sm:hidden">Action</span>
          <div className="bg-black/10 p-0.5 md:p-1 rounded-md md:rounded-lg">
            <Plus className="h-3 w-3 md:h-4 md:w-4" />
          </div>
        </Button>
      </div>
    </header>
  );
};
