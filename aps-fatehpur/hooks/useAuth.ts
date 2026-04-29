"use client";

import { useState, useEffect, useCallback } from "react";

interface AuthUser {
  _id: string;
  schoolId: string;
  name: string;
  email: string;
  role: "superadmin" | "school_admin" | "editor";
  isActive: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    // Verify token
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setState({
            user: data.data.user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          localStorage.removeItem("admin-token");
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        }
      })
      .catch(() => {
        localStorage.removeItem("admin-token");
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      });
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
      isLoading: false,
      isAuthenticated: true,
    });

    return data.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin-token");
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  return { ...state, login, logout };
}
