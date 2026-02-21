"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "perspectiveshift_user";

interface AppUser {
  id: string;
  email: string;
  displayAlias: string;
}

interface AppSession {
  user: AppUser;
}

interface AuthContextType {
  user: AppUser | null;
  session: AppSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginWithEmail: (email: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppUser;
        setUser(parsed);
        setSession({ user: parsed });
      }
    } catch {
      // ignore parse errors
    }
    setLoading(false);
  }, []);

  const loginWithEmail = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error ?? "로그인 실패" };
      }

      const appUser: AppUser = {
        id: data.userId,
        email: data.email,
        displayAlias: data.displayAlias,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
      setUser(appUser);
      setSession({ user: appUser });
      return { error: null };
    },
    [],
  );

  const logout = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setSession(null);
    // Clear server-side cookie
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session,
        loading,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
