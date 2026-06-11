"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api/client";
import { demoUserForRole, getSede, type RoleId, type Sede } from "./roles";

const DEMO_PASSWORD = "intimas123";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  title?: string;
  roleId: RoleId;
  sedeId: number;
}

interface Session {
  user: SessionUser;
  token: string;
  roleId: RoleId;
  sedeId: number;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    title?: string;
    roleId: number;
    sedeId?: number;
  };
}

function normalize(u: LoginResponse["user"], sedeId: number): SessionUser {
  return {
    id: u.id,
    name: u.nombre,
    email: u.email,
    title: u.title,
    roleId: u.roleId as RoleId,
    sedeId,
  };
}

interface AuthState {
  session: Session | null;
  hydrated: boolean;
  loginWithCredentials: (email: string, password: string, sedeId?: number) => Promise<void>;
  loginAsRole: (roleId: RoleId, sedeId?: number) => Promise<void>;
  switchRole: (roleId: RoleId) => Promise<void>;
  setSede: (sedeId: number) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      hydrated: false,

      loginWithCredentials: async (email, password, sedeId) => {
        const res = await api.post<LoginResponse>("/auth/login", { email, password });
        const sid = sedeId ?? res.user.sedeId ?? 1;
        const user = normalize(res.user, sid);
        set({ session: { user, token: res.access_token, roleId: user.roleId, sedeId: sid } });
      },

      loginAsRole: async (roleId, sedeId) => {
        const demo = demoUserForRole(roleId);
        await get().loginWithCredentials(demo.email, DEMO_PASSWORD, sedeId);
      },

      switchRole: async (roleId) => {
        const sid = get().session?.sedeId ?? 1;
        await get().loginAsRole(roleId, sid);
      },

      setSede: (sedeId) => {
        const s = get().session;
        if (s) set({ session: { ...s, sedeId, user: { ...s.user, sedeId } } });
      },

      logout: () => set({ session: null }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "intimas-session",
      partialize: (s) => ({ session: s.session }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

/** Sede activa derivada. */
export function useSede(): Sede {
  const sedeId = useAuth((s) => s.session?.sedeId ?? 1);
  return getSede(sedeId);
}
