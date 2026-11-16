"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiUrl } from "@/lib/api";
import { safeLocalStorage } from "@/lib/safariFixes";

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  avatar_url?: string | null;
  provider: string;
  is_pro: boolean;
  created_at: string;
}

export interface UserQuota {
  daily_searches_limit: number;
  daily_searches_used: number;
  daily_searches_remaining: number;
  daily_keywords_limit: number;
  daily_keywords_used: number;
  daily_keywords_remaining: number;
}

interface AuthContextType {
  user: UserProfile | null;
  quota: UserQuota | null;
  loading: boolean;
  token: string | null;
  authError: string | null;
  clearAuthError: () => void;
  loginWithGoogle: () => void;
  loginWithGitHub: () => void;
  loginDemo: () => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  decrementSearchQuota: () => void;
  decrementKeywordQuota: () => void;
}

const mapAuthError = (errCode: string): string => {
  switch (errCode) {
    case "google_not_configured":
      return "Google OAuth anahtarları sunucuda henüz tanımlanmadı. Render ortam değişkenlerine GOOGLE_CLIENT_ID ekleyene kadar 'Hızlı Test Oturumu' ile anında tam yetkiyle giriş yapabilirsiniz.";
    case "github_not_configured":
      return "GitHub OAuth anahtarları sunucuda henüz tanımlanmadı. Render ortam değişkenlerine GITHUB_CLIENT_ID ekleyene kadar 'Hızlı Test Oturumu' ile anında tam yetkiyle giriş yapabilirsiniz.";
    case "google_cancelled":
      return "Google ile oturum açma işlemi iptal edildi.";
    case "github_cancelled":
      return "GitHub ile oturum açma işlemi iptal edildi.";
    case "token_exchange_failed":
      return "Yetkilendirme anahtarı doğrulanamadı. Lütfen tekrar deneyin.";
    default:
      return "Giriş yapılırken bir sorun oluştu. Lütfen tekrar deneyin veya Hızlı Test Oturumu seçeneğini kullanın.";
  }
};


const defaultQuota: UserQuota = {
  daily_searches_limit: 200,
  daily_searches_used: 0,
  daily_searches_remaining: 200,
  daily_keywords_limit: 50,
  daily_keywords_used: 0,
  daily_keywords_remaining: 50,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (jwtToken: string) => {
    try {
      const res = await fetch(apiUrl("/api/v1/auth/me"), {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setQuota(data.quota);
        setToken(jwtToken);
        safeLocalStorage.setItem("urunbul_token", jwtToken);
      } else {
        // Geçersiz veya süresi dolmuş token
        safeLocalStorage.removeItem("urunbul_token");
        setUser(null);
        setQuota(null);
        setToken(null);
      }
    } catch (e) {
      console.error("Kullanıcı profili alınamadı:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. URL Query Parametresinden OAuth Token veya Hata Yakalama (?token=... veya ?auth_error=...)
    const params = new URLSearchParams(window.location.search);
    const queryToken = params.get("token");
    const queryError = params.get("auth_error");

    if (queryError) {
      setAuthError(mapAuthError(queryError));
    }

    if (queryToken) {
      safeLocalStorage.setItem("urunbul_token", queryToken);
      setToken(queryToken);
      // URL'deki query parametresini temizle, hash rotasını koru
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      url.searchParams.delete("auth_error");
      url.searchParams.delete("mode");
      window.history.replaceState(
        {},
        document.title,
        url.pathname + (url.search ? url.search : "") + (url.hash || "")
      );
      fetchUserProfile(queryToken);
      return;
    }

    // 2. LocalStorage'da kayıtlı token kontrolü
    const savedToken = safeLocalStorage.getItem("urunbul_token");
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const loginWithGoogle = () => {
    window.location.href = apiUrl("/api/v1/auth/google/login");
  };

  const loginWithGitHub = () => {
    window.location.href = apiUrl("/api/v1/auth/github/login");
  };

  const loginDemo = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/v1/auth/demo"), {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        const jwt = data.access_token;
        safeLocalStorage.setItem("urunbul_token", jwt);
        setToken(jwt);
        await fetchUserProfile(jwt);
        return true;
      }
    } catch (e) {
      console.error("Demo giriş hatası:", e);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const logout = () => {
    safeLocalStorage.removeItem("urunbul_token");
    setUser(null);
    setQuota(null);
    setToken(null);
  };

  const refreshUser = async () => {
    const curToken = token || safeLocalStorage.getItem("urunbul_token");
    if (curToken) {
      await fetchUserProfile(curToken);
    }
  };

  const decrementSearchQuota = () => {
    setQuota((prev) => {
      if (!prev) return defaultQuota;
      return {
        ...prev,
        daily_searches_used: prev.daily_searches_used + 1,
        daily_searches_remaining: Math.max(0, prev.daily_searches_remaining - 1),
      };
    });
  };

  const decrementKeywordQuota = () => {
    setQuota((prev) => {
      if (!prev) return defaultQuota;
      return {
        ...prev,
        daily_keywords_used: prev.daily_keywords_used + 1,
        daily_keywords_remaining: Math.max(0, prev.daily_keywords_remaining - 1),
      };
    });
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        quota,
        loading,
        token,
        authError,
        clearAuthError,
        loginWithGoogle,
        loginWithGitHub,
        loginDemo,
        logout,
        refreshUser,
        decrementSearchQuota,
        decrementKeywordQuota,
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
