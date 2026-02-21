"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "DRIVER";
  avatar?: string;
}

export interface AuthContextType {
  currentUser: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (requiredRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
        verifyToken(storedToken);
      } catch (e) {
        console.error("[v0] Failed to parse stored auth", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await apiClient.getCurrentUser();
      setCurrentUser(response.data.data);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      console.error("[v0] Token verification failed:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.login(email, password);
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      router.push("/dashboard");
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.register(email, password, name);
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      router.push("/dashboard");
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (err) {
      console.error("[v0] Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      router.push("/login");
    }
  };

  const hasPermission = (requiredRoles: string[]): boolean => {
    if (!currentUser) return false;
    return requiredRoles.includes(currentUser.role);
  };

  const value: AuthContextType = {
    currentUser,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    hasPermission,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function usePermissions(requiredRoles: string[]): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(requiredRoles);
}
