import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export type AppMode = 'mock' | 'live';

interface ModeContextValue {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  isMock: boolean;
  isLive: boolean;
  /**
   * Guard for actions that require a real backend.
   * In `mock` mode → runs the action.
   * In `live` mode → shows a toast and returns false.
   * Returns true when the caller should proceed.
   */
  requireMock: (featureName?: string) => boolean;
}

const ModeContext = createContext<ModeContextValue | null>(null);
const STORAGE_KEY = 'agentmesh:mode';

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    if (typeof window === 'undefined') return 'mock';
    return (localStorage.getItem(STORAGE_KEY) as AppMode) || 'mock';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const setMode = (m: AppMode) => {
    setModeState(m);
    toast({
      title: m === 'live' ? '🔌 Live mode' : '🧪 Mock mode',
      description:
        m === 'live'
          ? 'Buttons now require a real backend. Mock actions are disabled.'
          : 'Using simulated data and actions. No backend calls.',
    });
  };

  const requireMock = (featureName = 'This action') => {
    if (mode === 'mock') return true;
    toast({
      title: 'Live backend not connected',
      description: `${featureName} needs a real API. Switch to Mock mode in the navbar to try it now.`,
      variant: 'destructive',
    });
    return false;
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, isMock: mode === 'mock', isLive: mode === 'live', requireMock }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}
