"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authStore } from "@/lib/auth";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (data: { accessToken: string; refreshToken: string; user: User }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Sync state with localStorage on initial load
  useEffect(() => {
    setUser(authStore.user());
  }, []);

  const login = (data: { accessToken: string; refreshToken: string; user: User }) => {
    authStore.save(data);
    setUser(data.user); // Triggers immediate global state update
  };

  const logout = () => {
    authStore.clear();
    setUser(null); // Clears global state instantly
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
