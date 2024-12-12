"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession, getSession } from "next-auth/react";

interface SessionContextType {
  session: any; // Use your NextAuth session type here
  updateSession: (newSession?: any) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const { data: initialSession } = useSession();
  const [session, setSession] = useState(initialSession);

  // Update the session whenever the initial session changes
  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  const updateSession = async (newSession?: any) => {
    if (newSession) {
      // Update the session with provided data
      setSession(newSession);
    } else {
      // Re-fetch the session from the server if no session is passed
      const refreshedSession = await getSession();
      setSession(refreshedSession);
    }
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
