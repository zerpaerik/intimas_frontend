"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RESOURCES, getResource } from "@/lib/resources";
import type { Row } from "@/lib/resources/types";

function initialData(): Record<string, Row[]> {
  const d: Record<string, Row[]> = {};
  for (const r of RESOURCES) d[r.key] = r.seed.map((x) => ({ ...x }));
  return d;
}

interface DataState {
  data: Record<string, Row[]>;
  hydrated: boolean;
  create: (key: string, row: Record<string, unknown>) => Row;
  update: (key: string, id: number, row: Record<string, unknown>) => void;
  remove: (key: string, id: number) => void;
  reset: () => void;
  setHydrated: () => void;
}

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
      data: initialData(),
      hydrated: false,
      create: (key, row) => {
        const list = get().data[key] ?? [];
        const id = list.reduce((m, r) => Math.max(m, r.id), 0) + 1;
        const nuevo = { ...row, id } as Row;
        set({ data: { ...get().data, [key]: [nuevo, ...list] } });
        return nuevo;
      },
      update: (key, id, row) => {
        const list = get().data[key] ?? [];
        set({
          data: {
            ...get().data,
            [key]: list.map((r) => (r.id === id ? ({ ...r, ...row, id } as Row) : r)),
          },
        });
      },
      remove: (key, id) => {
        const list = get().data[key] ?? [];
        set({ data: { ...get().data, [key]: list.filter((r) => r.id !== id) } });
      },
      reset: () => set({ data: initialData() }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "intimas-data",
      version: 1,
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/** Filas de un recurso, con campos derivados aplicados. */
export function useRows(key: string): Row[] {
  const rows = useData((s) => s.data[key]);
  const cfg = getResource(key);
  return React.useMemo(() => {
    const base = rows ?? [];
    return cfg?.derive ? base.map((r) => ({ ...r, ...cfg.derive!(r) })) : base;
  }, [rows, cfg]);
}

export function useRow(key: string, id: number): Row | undefined {
  const rows = useRows(key);
  return rows.find((r) => r.id === id);
}
