"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AtnItem {
  kind: string;
  nombre: string;
  monto: number;
  abono: number;
  pago: string;
}

export interface AtnPaciente {
  id: number;
  nombres: string;
  apellidos: string;
  tipoDoc: string;
  numDoc: string;
  sexo: string;
  fechaNacimiento?: string;
  telefono?: string;
}

export type AtnEstado = "Pagado" | "Parcial" | "Pendiente";

export interface Atencion {
  id: number;
  fecha: string; // ISO
  paciente: AtnPaciente;
  origenTipo: string;
  origenValor: string;
  items: AtnItem[];
  observaciones: string;
  total: number;
  abono: number;
  saldo: number;
  estado: AtnEstado;
  usuario: string;
}

export function computeTotals(items: AtnItem[]) {
  const total = items.reduce((a, b) => a + (b.monto || 0), 0);
  const abono = items.reduce((a, b) => a + (b.abono || 0), 0);
  const saldo = total - abono;
  const estado: AtnEstado = saldo <= 0 ? "Pagado" : abono <= 0 ? "Pendiente" : "Parcial";
  return { total, abono, saldo, estado };
}

const PACS: AtnPaciente[] = [
  { id: 1, nombres: "María Elena", apellidos: "Flores Quispe", tipoDoc: "DNI", numDoc: "70215488", sexo: "Femenino", fechaNacimiento: "1992-04-18", telefono: "987654321" },
  { id: 2, nombres: "Carlos Alberto", apellidos: "Ramos León", tipoDoc: "DNI", numDoc: "45821190", sexo: "Masculino", fechaNacimiento: "1985-11-02", telefono: "961203847" },
  { id: 3, nombres: "Lucía", apellidos: "Huamán Torres", tipoDoc: "DNI", numDoc: "73910022", sexo: "Femenino", fechaNacimiento: "1998-07-25", telefono: "934118827" },
  { id: 4, nombres: "Rosa María", apellidos: "Cárdenas Vega", tipoDoc: "CE", numDoc: "002841558", sexo: "Femenino", fechaNacimiento: "1979-01-30", telefono: "920458112" },
  { id: 6, nombres: "Ana Paula", apellidos: "Salazar Núñez", tipoDoc: "DNI", numDoc: "76554321", sexo: "Femenino", fechaNacimiento: "2001-03-08", telefono: "913882044" },
  { id: 8, nombres: "Carmen Rosa", apellidos: "Díaz Paredes", tipoDoc: "DNI", numDoc: "70019988", sexo: "Femenino", fechaNacimiento: "1995-06-11", telefono: "938201577" },
];

function isoDaysAgo(n: number, h: number, m: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

interface SeedDef {
  pac: number;
  dias: number;
  h: number;
  m: number;
  origenTipo: string;
  origenValor: string;
  items: AtnItem[];
  obs?: string;
}

const I = (kind: string, nombre: string, monto: number, abono = monto, pago = "Efectivo"): AtnItem => ({ kind, nombre, monto, abono, pago });

const SEED: SeedDef[] = [
  { pac: 0, dias: 0, h: 9, m: 15, origenTipo: "Profesional", origenValor: "Patricia Núñez Salinas", items: [I("Ecografía", "Ecografía obstétrica", 80), I("Consulta", "Consulta ginecológica", 60)] },
  { pac: 2, dias: 0, h: 10, m: 30, origenTipo: "Personal", origenValor: "Mónica Flores Díaz", items: [I("Laboratorio", "Hemograma completo", 35), I("Laboratorio", "Examen completo de orina", 20)] },
  { pac: 4, dias: 0, h: 11, m: 45, origenTipo: "Profesional", origenValor: "Roberto Aguilar Pérez", items: [I("Paquete", "Paquete Control Ginecológico", 180, 100)], obs: "Abono parcial, completa la próxima visita." },
  { pac: 1, dias: 1, h: 16, m: 20, origenTipo: "Particular", origenValor: "Referido externo", items: [I("Ecografía", "Ecografía transvaginal", 90)] },
  { pac: 3, dias: 1, h: 8, m: 50, origenTipo: "Profesional", origenValor: "Elena Vargas Loayza", items: [I("Salud Mental", "Consulta psicológica", 120, 0)] },
  { pac: 5, dias: 2, h: 12, m: 10, origenTipo: "Personal", origenValor: "Luis Castillo Ramos", items: [I("Otros", "Papanicolaou", 45), I("Laboratorio", "Perfil hormonal", 120)] },
  { pac: 0, dias: 3, h: 9, m: 40, origenTipo: "Profesional", origenValor: "Patricia Núñez Salinas", items: [I("Consulta", "Control prenatal", 50)] },
  { pac: 2, dias: 5, h: 15, m: 0, origenTipo: "Personal", origenValor: "Mónica Flores Díaz", items: [I("Rayos X", "Radiografía de tórax", 70)] },
  { pac: 4, dias: 8, h: 10, m: 15, origenTipo: "Profesional", origenValor: "Roberto Aguilar Pérez", items: [I("Paquete", "Paquete Prenatal Básico", 250, 250)] },
  { pac: 1, dias: 12, h: 17, m: 30, origenTipo: "Particular", origenValor: "Referido externo", items: [I("Ecografía", "Ecografía mamaria", 100), I("Laboratorio", "TSH", 50)] },
];

function buildSeed(): Atencion[] {
  return SEED.map((s, i) => {
    const paciente = PACS[s.pac];
    const { total, abono, saldo, estado } = computeTotals(s.items);
    return {
      id: SEED.length - i, // ids descendentes; los más nuevos con id mayor
      fecha: isoDaysAgo(s.dias, s.h, s.m),
      paciente,
      origenTipo: s.origenTipo,
      origenValor: s.origenValor,
      items: s.items,
      observaciones: s.obs ?? "",
      total,
      abono,
      saldo,
      estado,
      usuario: "Erik Zerpa",
    };
  });
}

export interface AtencionInput {
  paciente: AtnPaciente;
  origenTipo: string;
  origenValor: string;
  items: AtnItem[];
  observaciones: string;
  usuario: string;
}

interface AtnState {
  atenciones: Atencion[];
  hydrated: boolean;
  createAtencion: (input: AtencionInput) => Atencion;
  updateAtencion: (id: number, input: AtencionInput) => void;
  removeAtencion: (id: number) => void;
  setHydrated: () => void;
}

export const useAtenciones = create<AtnState>()(
  persist(
    (set, get) => ({
      atenciones: buildSeed(),
      hydrated: false,
      createAtencion: (input) => {
        const list = get().atenciones;
        const id = list.reduce((m, a) => Math.max(m, a.id), 0) + 1;
        const t = computeTotals(input.items);
        const nueva: Atencion = {
          id,
          fecha: new Date().toISOString(),
          ...input,
          ...t,
        };
        set({ atenciones: [nueva, ...list] });
        return nueva;
      },
      updateAtencion: (id, input) => {
        const t = computeTotals(input.items);
        set({
          atenciones: get().atenciones.map((a) =>
            a.id === id ? { ...a, ...input, ...t } : a,
          ),
        });
      },
      removeAtencion: (id) =>
        set({ atenciones: get().atenciones.filter((a) => a.id !== id) }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "intimas-atenciones",
      version: 1,
      onRehydrateStorage: () => (s) => s?.setHydrated(),
    },
  ),
);

export function useAtencion(id: number): Atencion | undefined {
  return useAtenciones((s) => s.atenciones.find((a) => a.id === id));
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}
