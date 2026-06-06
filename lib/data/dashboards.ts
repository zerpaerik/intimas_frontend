import {
  Banknote,
  Cake,
  CalendarClock,
  ClipboardPlus,
  CreditCard,
  FileCheck2,
  FileClock,
  FlaskConical,
  HandCoins,
  Landmark,
  type LucideIcon,
  NotebookPen,
  Receipt,
  Route,
  Smartphone,
  Stethoscope,
  TestTubeDiagonal,
  Timer,
  UserPlus,
  UserRound,
  Wallet,
} from "lucide-react";
import { formatPEN } from "@/lib/format";
import {
  actividadReciente,
  ingresosSerie,
  pagosSerie,
  pendientesPorRol,
  topServicios,
} from "./dashboard";
import type { RoleId } from "@/lib/auth/roles";

type Serie = { key: string; name: string; color: string };
type ValueMode = "money" | "count";

export interface KpiDef {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  accent: string;
  hint?: string;
}

export interface DashConfig {
  primary: { label: string; href: string; icon: LucideIcon };
  kpis: KpiDef[];
  area: { title: string; subtitle: string; data: Record<string, unknown>[]; xKey: string; series: Serie[]; mode: ValueMode };
  donut: { title: string; subtitle: string; data: { name: string; value: number; color: string }[]; mode: ValueMode };
  bar: { title: string; subtitle: string; data: Record<string, unknown>[]; labelKey: string; valueKey: string; unit: string };
  activity: { title: string; items: { titulo: string; detalle: string; hora: string; color: string }[] };
  pendientes: { titulo: string; items: string[] };
  quick: { label: string; href: string; icon: LucideIcon }[];
}

export type DashProfile = "finanzas" | "clinica" | "laboratorio" | "visitador";

export function profileForRole(roleId: RoleId): DashProfile {
  if (roleId === 7) return "clinica";
  if (roleId === 10) return "laboratorio";
  if (roleId === 11) return "visitador";
  return "finanzas"; // 1, 2, 12 (administrativos)
}

const DIAS = ["24", "25", "26", "27", "28", "29", "30", "31", "01", "02", "03", "04", "05", "06"];
const serie = (key: string, vals: number[]) => DIAS.map((dia, i) => ({ dia, [key]: vals[i] }));

const atencionesSerie = serie("atenciones", [12, 15, 9, 18, 16, 21, 7, 14, 17, 15, 22, 18, 20, 19]);
const analisisSerie = serie("analisis", [18, 22, 14, 26, 20, 28, 9, 19, 24, 21, 30, 25, 27, 26]);
const visitasSerie = serie("visitas", [2, 3, 1, 4, 3, 5, 0, 2, 4, 3, 5, 3, 4, 3]);

// ---- FINANZAS (roles 1, 2, 12) ----
const finanzas: DashConfig = {
  primary: { label: "Nueva atención", href: "/movimientos/atenciones/nueva", icon: ClipboardPlus },
  kpis: [
    { label: "Efectivo", value: formatPEN(4820), delta: 12.5, icon: Banknote, accent: "#16a34a" },
    { label: "Tarjeta", value: formatPEN(2150), delta: 4.2, icon: CreditCard, accent: "#0091d5" },
    { label: "Depósito", value: formatPEN(1300), delta: -1.8, icon: Landmark, accent: "#7c3aed" },
    { label: "Yape", value: formatPEN(3640), delta: 18.3, icon: Smartphone, accent: "#e6007e" },
    { label: "Gastos", value: formatPEN(1180), delta: 2.1, icon: Receipt, accent: "#ef4444" },
    { label: "Total Efectivo", value: formatPEN(3640), icon: Wallet, accent: "#00b8a9", hint: "Efectivo − gastos" },
  ],
  area: {
    title: "Ingresos vs. gastos",
    subtitle: "Últimos 14 días",
    data: ingresosSerie as unknown as Record<string, unknown>[],
    xKey: "dia",
    series: [
      { key: "ingresos", name: "Ingresos", color: "#e6007e" },
      { key: "gastos", name: "Gastos", color: "#0091d5" },
    ],
    mode: "money",
  },
  donut: { title: "Métodos de pago", subtitle: "Distribución de hoy", data: pagosSerie, mode: "money" },
  bar: { title: "Servicios más solicitados", subtitle: "Este mes", data: topServicios as unknown as Record<string, unknown>[], labelKey: "nombre", valueKey: "total", unit: "atenciones" },
  activity: { title: "Actividad reciente", items: actividadReciente },
  pendientes: pendientesPorRol[1],
  quick: [
    { label: "Nueva atención", href: "/movimientos/atenciones/nueva", icon: ClipboardPlus },
    { label: "Registrar paciente", href: "/archivos/pacientes/nuevo", icon: UserPlus },
    { label: "Ver pacientes", href: "/archivos/pacientes", icon: UserRound },
    { label: "Cuentas por cobrar", href: "/movimientos/cobrar", icon: HandCoins },
  ],
};

// ---- CLÍNICA (rol 7) ----
const clinica: DashConfig = {
  primary: { label: "Nueva atención", href: "/movimientos/atenciones/nueva", icon: ClipboardPlus },
  kpis: [
    { label: "Atenciones hoy", value: "18", delta: 9, icon: ClipboardPlus, accent: "#e6007e" },
    { label: "Pacientes atendidos", value: "14", icon: UserRound, accent: "#0091d5" },
    { label: "Consultas", value: "7", delta: 5, icon: NotebookPen, accent: "#7c3aed" },
    { label: "Sesiones pendientes", value: "5", icon: CalendarClock, accent: "#f5a623" },
  ],
  area: {
    title: "Atenciones por día",
    subtitle: "Últimos 14 días",
    data: atencionesSerie,
    xKey: "dia",
    series: [{ key: "atenciones", name: "Atenciones", color: "#7c3aed" }],
    mode: "count",
  },
  donut: {
    title: "Atenciones por tipo",
    subtitle: "Este mes",
    data: [
      { name: "Ecografía", value: 38, color: "#e6007e" },
      { name: "Consulta", value: 27, color: "#7c3aed" },
      { name: "Laboratorio", value: 22, color: "#00b8a9" },
      { name: "Salud Mental", value: 12, color: "#0091d5" },
    ],
    mode: "count",
  },
  bar: { title: "Servicios más solicitados", subtitle: "Este mes", data: topServicios as unknown as Record<string, unknown>[], labelKey: "nombre", valueKey: "total", unit: "atenciones" },
  activity: {
    title: "Actividad clínica",
    items: [
      { titulo: "Atención registrada", detalle: "María Flores · Ecografía obstétrica", hora: "10:42", color: "#e6007e" },
      { titulo: "Historia actualizada", detalle: "Rosa Cárdenas · Control prenatal", hora: "10:10", color: "#7c3aed" },
      { titulo: "Sesión agendada", detalle: "Ana Salazar · Psicología", hora: "09:35", color: "#0091d5" },
      { titulo: "Paciente nuevo", detalle: "Carlos Ramos", hora: "09:12", color: "#00b8a9" },
    ],
  },
  pendientes: pendientesPorRol[7],
  quick: [
    { label: "Nueva atención", href: "/movimientos/atenciones/nueva", icon: ClipboardPlus },
    { label: "Ver pacientes", href: "/archivos/pacientes", icon: UserRound },
    { label: "Historias", href: "/consultas/historias", icon: NotebookPen },
    { label: "Sesiones", href: "/sesiones/por-atender", icon: CalendarClock },
  ],
};

// ---- LABORATORIO (rol 10) ----
const laboratorio: DashConfig = {
  primary: { label: "Registrar resultado", href: "/resultados/pendientes-laboratorio", icon: FileCheck2 },
  kpis: [
    { label: "Muestras del día", value: "26", delta: 6, icon: FlaskConical, accent: "#00b8a9" },
    { label: "Resultados pendientes", value: "8", icon: FileClock, accent: "#f5a623" },
    { label: "Entregados hoy", value: "19", delta: 11, icon: FileCheck2, accent: "#16a34a" },
    { label: "Tiempo prom. entrega", value: "22 h", icon: Timer, accent: "#0091d5" },
  ],
  area: {
    title: "Análisis procesados por día",
    subtitle: "Últimos 14 días",
    data: analisisSerie,
    xKey: "dia",
    series: [{ key: "analisis", name: "Análisis", color: "#00b8a9" }],
    mode: "count",
  },
  donut: {
    title: "Estado de muestras",
    subtitle: "Hoy",
    data: [
      { name: "En proceso", value: 12, color: "#f5a623" },
      { name: "Pendiente validación", value: 8, color: "#0091d5" },
      { name: "Entregado", value: 19, color: "#16a34a" },
    ],
    mode: "count",
  },
  bar: {
    title: "Análisis más solicitados",
    subtitle: "Este mes",
    data: [
      { nombre: "Hemograma completo", total: 31 },
      { nombre: "Examen de orina", total: 24 },
      { nombre: "Glucosa basal", total: 20 },
      { nombre: "Perfil lipídico", total: 16 },
      { nombre: "TSH", total: 12 },
      { nombre: "Cultivo vaginal", total: 9 },
    ],
    labelKey: "nombre",
    valueKey: "total",
    unit: "pruebas",
  },
  activity: {
    title: "Resultados recientes",
    items: [
      { titulo: "Resultado validado", detalle: "Hemograma · María Flores", hora: "10:48", color: "#16a34a" },
      { titulo: "Muestra recibida", detalle: "Orina · Pedro Quispe", hora: "10:20", color: "#f5a623" },
      { titulo: "Resultado entregado", detalle: "Glucosa · Jorge Mendoza", hora: "09:50", color: "#00b8a9" },
      { titulo: "Análisis iniciado", detalle: "Perfil hormonal · Lucía Huamán", hora: "09:18", color: "#0091d5" },
    ],
  },
  pendientes: pendientesPorRol[10],
  quick: [
    { label: "Resultados pendientes", href: "/resultados/pendientes-laboratorio", icon: FileClock },
    { label: "Catálogo de análisis", href: "/archivos/analisis", icon: TestTubeDiagonal },
    { label: "Sesiones", href: "/sesiones/por-atender", icon: CalendarClock },
    { label: "Historial de pacientes", href: "/reportes/historial-pacientes", icon: UserRound },
  ],
};

// ---- VISITADOR (rol 11) ----
const visitador: DashConfig = {
  primary: { label: "Registrar visita", href: "/visitador/visitas", icon: Route },
  kpis: [
    { label: "Visitas del mes", value: "34", delta: 12, icon: Route, accent: "#f5a623" },
    { label: "Profesionales activos", value: "28", icon: Stethoscope, accent: "#0091d5" },
    { label: "Comisiones por entregar", value: formatPEN(1250), icon: HandCoins, accent: "#e6007e" },
    { label: "Cumpleaños del mes", value: "3", icon: Cake, accent: "#7c3aed" },
  ],
  area: {
    title: "Visitas por día",
    subtitle: "Últimos 14 días",
    data: visitasSerie,
    xKey: "dia",
    series: [{ key: "visitas", name: "Visitas", color: "#f5a623" }],
    mode: "count",
  },
  donut: {
    title: "Estado de comisiones",
    subtitle: "Mes en curso",
    data: [
      { name: "Por entregar", value: 1250, color: "#f5a623" },
      { name: "Entregadas", value: 3820, color: "#16a34a" },
    ],
    mode: "money",
  },
  bar: {
    title: "Visitas por profesional",
    subtitle: "Este mes",
    data: [
      { nombre: "Dra. Núñez", total: 9 },
      { nombre: "Dr. Aguilar", total: 7 },
      { nombre: "Dra. Vargas", total: 6 },
      { nombre: "Dr. Espinoza", total: 5 },
      { nombre: "Dra. Rojas", total: 4 },
    ],
    labelKey: "nombre",
    valueKey: "total",
    unit: "visitas",
  },
  activity: {
    title: "Actividad reciente",
    items: [
      { titulo: "Visita registrada", detalle: "Dra. Núñez · Ginecología", hora: "11:05", color: "#f5a623" },
      { titulo: "Comisión entregada", detalle: "S/ 420 · Dr. Aguilar", hora: "10:30", color: "#16a34a" },
      { titulo: "Cumpleaños", detalle: "Dr. Espinoza cumple hoy", hora: "—", color: "#e6007e" },
      { titulo: "Visita registrada", detalle: "Dra. Vargas · Ecografía", hora: "09:40", color: "#0091d5" },
    ],
  },
  pendientes: pendientesPorRol[11],
  quick: [
    { label: "Visitas", href: "/visitador/visitas", icon: Route },
    { label: "Comisiones por entregar", href: "/visitador/por-entregar", icon: HandCoins },
    { label: "Cumpleaños", href: "/visitador/cumpleanos", icon: Cake },
    { label: "Comisiones entregadas", href: "/visitador/entregadas", icon: FileCheck2 },
  ],
};

const CONFIGS: Record<DashProfile, DashConfig> = { finanzas, clinica, laboratorio, visitador };

export function dashboardFor(roleId: RoleId): DashConfig {
  const cfg = CONFIGS[profileForRole(roleId)];
  return { ...cfg, pendientes: pendientesPorRol[roleId] ?? cfg.pendientes };
}
