import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { auth } from '../api/client';
import type { User } from '../api/types';

interface SessionValue {
  user: User | null;
  setUser: (u: User | null) => void;
  signOut: () => Promise<void>;
  toggleSaved: (propertyId: string) => Promise<boolean>;
  isSaved: (propertyId: string) => boolean;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.current());

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
  }, []);

  const toggleSaved = useCallback(async (id: string) => {
    const next = await auth.toggleSaved(id);
    setUser(next);
    return next.savedPropertyIds.includes(id);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ user, setUser, signOut, toggleSaved, isSaved: (id) => !!user?.savedPropertyIds.includes(id) }),
    [user, signOut, toggleSaved],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
