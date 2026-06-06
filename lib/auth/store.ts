"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type DemoUser,
  type RoleId,
  type Sede,
  demoUserForRole,
  getSede,
} from "./roles";

interface Session {
  user: DemoUser;
  roleId: RoleId;
  sedeId: number;
}

interface AuthState {
  session: Session | null;
  /** true cuando el estado persistido ya se hidrató (evita parpadeos). */
  hydrated: boolean;
  login: (user: DemoUser, sedeId: number) => void;
  loginAsRole: (roleId: RoleId, sedeId?: number) => void;
  logout: () => void;
  setSede: (sedeId: number) => void;
  /** Cambio rápido de rol para la demo (mantiene la sede). */
  switchRole: (roleId: RoleId) => void;
  setHydrated: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      hydrated: false,
      login: (user, sedeId) =>
        set({ session: { user, roleId: user.roleId, sedeId } }),
      loginAsRole: (roleId, sedeId = 1) => {
        const user = demoUserForRole(roleId);
        set({ session: { user, roleId, sedeId } });
      },
      logout: () => set({ session: null }),
      setSede: (sedeId) => {
        const s = get().session;
        if (s) set({ session: { ...s, sedeId } });
      },
      switchRole: (roleId) => {
        const s = get().session;
        const user = demoUserForRole(roleId);
        set({
          session: { user, roleId, sedeId: s?.sedeId ?? 1 },
        });
      },
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

/** Atajos derivados para los componentes. */
export function useSede(): Sede {
  const sedeId = useAuth((s) => s.session?.sedeId ?? 1);
  return getSede(sedeId);
}
