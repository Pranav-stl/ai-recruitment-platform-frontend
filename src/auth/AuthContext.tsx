import { createContext } from "react";

export interface AuthUser {
  token: string;
  id: number;
  fullName: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER";
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);