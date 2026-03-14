import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./auth-context";
import { API_BASE } from "../lib/api";

const USER_KEY = "smarteai_user";
const TOKEN_KEY = "token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isReady, setIsReady] = useState(false);

  const isLoggedIn = Boolean(token);

  const persistAuth = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
      } else if (res.status === 401) {
        logout();
      }
    } catch {
      // ignore network errors
    }
  }, [logout]);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      await refreshUser();
      if (isMounted) setIsReady(true);
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    persistAuth(data);
    return data;
  }, [persistAuth]);

  const signup = useCallback(async (email, password, name = "") => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");
    persistAuth(data);
    return data;
  }, [persistAuth]);

  const loginWithGoogle = useCallback(async (credential) => {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Google sign-in failed");
    persistAuth(data);
    return data;
  }, [persistAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        isReady,
        login,
        signup,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
