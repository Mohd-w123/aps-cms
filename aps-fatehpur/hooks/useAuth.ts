"use client";

import React, { useState, useEffect, useCallback, useContext, createContext } from "react";

interface AuthUser {
  _id: string;
  schoolId?: string;
  schoolSlug?: string;
  name: string;
  email: string;
  role: "superadmin" | "school_admin" | "editor" | "sales";
  isActive: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  authReady: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ token: string; user: AuthUser }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    authReady: false,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      setState({ user: null, token: null, authReady: true, isAuthenticated: false });
      return;
    }

    const controller = new AbortController();

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setState({
            user: data.data.user,
            token,
            authReady: true,
            isAuthenticated: true,
          });
        } else {
          localStorage.removeItem("admin-token");
          setState({ user: null, token: null, authReady: true, isAuthenticated: false });
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        localStorage.removeItem("admin-token");
        setState({ user: null, token: null, authReady: true, isAuthenticated: false });
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Login failed");
    }

    localStorage.setItem("admin-token", data.data.token);
    setState({
      user: data.data.user,
      token: data.data.token,
      authReady: true,
      isAuthenticated: true,
    });

    return data.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin-token");
    setState({ user: null, token: null, authReady: true, isAuthenticated: false });
  }, []);

  return React.createElement(
    AuthContext.Provider,
    { value: { ...state, isLoading: !state.authReady, login, logout } },
    children
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
