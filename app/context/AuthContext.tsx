"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "customer";
};

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  securityQuestion: string;
  securityAnswer: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (data: RegisterData) => Promise<string | null>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || "Login failed.";
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return null;
    } catch {
      return "Network error. Please try again.";
    }
  };

  const register = async (formData: RegisterData): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) return data.error || "Registration failed.";
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return null;
    } catch {
      return "Network error. Please try again.";
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
