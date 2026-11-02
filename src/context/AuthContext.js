"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on client load
  useEffect(() => {
    const savedToken = localStorage.getItem("learner_token");
    const savedUser = localStorage.getItem("learner_user");

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      // Verify token with /api/me
      fetchApi("/me", { token: savedToken })
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem("learner_user", JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // Token invalid or expired
          logout(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password, remember = false) {
    const res = await fetchApi("/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember }),
    });

    if (res?.token && res?.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("learner_token", res.token);
      localStorage.setItem("learner_user", JSON.stringify(res.user));
    }

    return res;
  }

  async function logout(callApi = true) {
    if (callApi && token) {
      try {
        await fetchApi("/logout", {
          method: "POST",
          token,
        });
      } catch (err) {
        console.error("Logout request failed:", err);
      }
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem("learner_token");
    localStorage.removeItem("learner_user");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

