"use client";
import { promises } from "dns";
import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";

type AuthContextType = {
  user: string | null;
  authChecked: boolean;
  // login: (id: string) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const refreshAuth = async () => {
    try {
      const res = await fetch("/api/me", {
        cache: "no-store",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  };
  // useEffect(() => {
  //   const saved = localStorage.getItem("auth_user");
  //   if (saved) setUser(saved);
  // }, []);
  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async () => {
    await refreshAuth();
  };
  // const login = (id: string) => {
  //   setUser(id);
  //   localStorage.setItem("auth_user", id);
  // };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    // localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, authChecked, login, logout, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  // 그냥 일일히 useContext해서 꺼내는작업을 단축하기위한 함수
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
