'use client';

import { useArchitectStore } from '@/store/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Plus, History, User, LogOut, Loader2 } from 'lucide-react';
import { signIn, signOut, useSession } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { HistorySidebar } from './HistorySidebar';
import Image from 'next/image';

export const Header = () => {
  const reset = useArchitectStore((state) => state.reset);
  const { data: session, isPending } = useSession();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async () => {
    await signIn.social({
      provider: 'google',
      callbackURL: window.location.origin,
    });
  };

  return (
    <header className="w-full h-20 md:h-24 flex items-center justify-between px-4 md:px-8 py-4 z-50">
      <div className="flex flex-col">
        <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          Hi Architect
        </h1>
        <p className="hidden md:block text-zinc-600 text-sm font-medium">
          Ready to refine some logic?
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {mounted && session ? (
          <div className="flex items-center gap-2 md:gap-3">
             <Button
              variant="secondary"
              size="icon"
              className="rounded-xl h-9 w-9 md:h-11 md:w-11 bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
              onClick={() => setIsHistoryOpen(true)}
            >
              <History className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 md:px-3 md:py-1.5 rounded-xl md:rounded-2xl">
              <div className="h-6 w-6 md:h-8 md:w-8 rounded-full overflow-hidden border border-white/20 relative">
                <Image 
                  src={session.user.image || ''} 
                  alt={session.user.name || 'User avatar'} 
                  fill
                  className="object-cover" 
                />
              </div>
              <span className="hidden sm:inline text-[10px] md:text-xs font-bold text-white max-w-[100px] truncate">
                {session.user.name}
              </span>
              <button 
                onClick={() => signOut()}
                className="text-zinc-500 hover:text-red-400 transition-colors ml-1"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4" />
              </button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            className="rounded-xl md:rounded-2xl gap-2 font-bold px-3 md:px-5 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs md:text-sm h-9 md:h-11"
            onClick={handleLogin}
            suppressHydrationWarning
          >
            {mounted && isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <User className="h-4 w-4 md:h-5 md:w-5" />
            )}
            <span className="hidden sm:inline">Login</span>
          </Button>
        )}

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

      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </header>
  );
};
