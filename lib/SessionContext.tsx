"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession, getSession } from "next-auth/react";
import type { Session } from "next-auth"; // Import the extended Session type

interface SessionContextType {
  session: Session | null; // Use the extended NextAuth session type
  updateSession: (newSession?: Session | null) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const { data: initialSession } = useSession(); // Use the NextAuth hook
  const [session, setSession] = useState<Session | null>(initialSession);

  // Update the session whenever the initial session changes
  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  const updateSession = async () => {
    const res = await fetch("/api/session/refresh");
    const refreshed = await res.json();
    setSession(refreshed);
  };

  return (
    <SessionContext.Provider value={{ session, updateSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useCustomSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useCustomSession must be used within a SessionProvider");
  }
  return context;
};
