"use client";
import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";

type AuthContextType = {
  user: string | null;
  login: (id: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("auth_user");
    if (saved) setUser(saved);
  }, []);

  const login = (id: string) => {
    setUser(id);
    localStorage.setItem("auth_user", id);
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
