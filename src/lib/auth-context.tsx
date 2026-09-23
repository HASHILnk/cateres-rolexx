import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  username: string;
  is_superadmin?: boolean;
}

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("rolex_auth_user");
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rolex_auth_token");
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Validate existing token on load
  useEffect(() => {
    async function checkAuth() {
      const savedToken = localStorage.getItem("rolex_auth_token");
      if (savedToken) {
        try {
          const currentAdmin = await api.auth.getMe();
          setAdmin(currentAdmin);
          localStorage.setItem("rolex_auth_user", JSON.stringify(currentAdmin));
        } catch {
          localStorage.removeItem("rolex_auth_token");
          localStorage.removeItem("rolex_auth_user");
          setAdmin(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.auth.login(username, password);
      setToken(response.access_token);
      setAdmin(response.admin);
      localStorage.setItem("rolex_auth_token", response.access_token);
      localStorage.setItem("rolex_auth_user", JSON.stringify(response.admin));
      toast.success(`Welcome back, ${response.admin.username}!`);
      return true;
    } catch (err: any) {
      toast.error(err.message || "Invalid username or password");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("rolex_auth_token");
    localStorage.removeItem("rolex_auth_user");
    setAdmin(null);
    setToken(null);
    toast.info("Logged out from Rolex Management Console");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isLoading }}>
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
