import { create } from "zustand";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: "student" | "lecturer";
  matricNo?: string;
  lecturerId?: string;
  department?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const u = sessionStorage.getItem("sams_user");
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  })(),
  token: sessionStorage.getItem("sams_token"),

  setAuth: (user, token) => {
    sessionStorage.setItem("sams_token", token);
    sessionStorage.setItem("sams_user", JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    sessionStorage.removeItem("sams_token");
    sessionStorage.removeItem("sams_user");
    set({ user: null, token: null });
  },
}));
