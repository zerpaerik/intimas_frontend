import {
  Activity,
  BarChartBig,
  Banknote,
  Boxes,
  Building2,
  CalendarClock,
  ClipboardPlus,
  Contact,
  CreditCard,
  Droplets,
  FileCheck2,
  HandCoins,
  History,
  KeyRound,
  LayoutDashboard,
  Microscope,
  MonitorSmartphone,
  NotebookPen,
  PackageOpen,
  Percent,
  Receipt,
  Route,
  ShieldCheck,
  ShieldPlus,
  Stethoscope,
  StickyNote,
  TestTubeDiagonal,
  UserCog,
  UserRound,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import type { RoleId } from "./auth/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: RoleId[];
  /** Marca los módulos realmente implementados en el mockup. */
  built?: boolean;
}

export interface NavGroup {
  id: string;
  label: string | null;
  items: NavItem[];
}

const ALL: RoleId[] = [1, 2, 7, 10, 11, 12];

export const NAV: NavGroup[] = [
  {
    id: "inicio",
    label: null,
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ALL,
        built: true,
      },
    ],
  },
  {
    id: "archivo",
    label: "Archivo",
    items: [
      { label: "Pacientes", href: "/archivos/pacientes", icon: UserRound, roles: [1, 2, 7], built: true },
      { label: "Profesionales", href: "/archivos/profesionales", icon: Stethoscope, roles: [1], built: true },
      { label: "Servicios", href: "/archivos/servicios", icon: Activity, roles: [1], built: true },
      { label: "Análisis", href: "/archivos/analisis", icon: TestTubeDiagonal, roles: [1], built: true },
      { label: "Laboratorios", href: "/archivos/laboratorio", icon: Microscope, roles: [1], built: true },
      { label: "Paquetes", href: "/archivos/paquetes", icon: PackageOpen, roles: [1], built: true },
      { label: "Personal", href: "/archivos/personal", icon: Contact, roles: [1], built: true },
      { label: "Centros", href: "/archivos/centros", icon: Building2, roles: [1], built: true },
      { label: "Productos", href: "/archivos/productos", icon: Boxes, roles: [1], built: true },
      { label: "Material", href: "/archivos/material", icon: Droplets, roles: [1], built: true },
    ],
  },
  {
    id: "movimientos",
    label: "Movimientos",
    items: [
      { label: "Atenciones", href: "/movimientos/atenciones", icon: ClipboardPlus, roles: [1, 2, 7] },
      { label: "Gastos", href: "/movimientos/gastos", icon: Receipt, roles: [1, 2, 7] },
      { label: "Otros Ingresos", href: "/movimientos/ingresos", icon: Banknote, roles: [1, 2, 7] },
      { label: "Cuentas por Cobrar", href: "/movimientos/cobrar", icon: HandCoins, roles: [1, 2, 7] },
      { label: "Historial de Cobros", href: "/movimientos/historial-cobros", icon: History, roles: [1, 2, 7] },
      { label: "Pagos a Personal", href: "/movimientos/pagos-personal", icon: CreditCard, roles: [1, 2] },
    ],
  },
  {
    id: "comisiones",
    label: "Comisiones",
    items: [
      { label: "Por Pagar — Personal", href: "/comisiones/personal", icon: Percent, roles: [1, 2] },
      { label: "Por Pagar — Profesional", href: "/comisiones/profesional", icon: Percent, roles: [1, 2] },
      { label: "Pagadas — Personal", href: "/comisiones/pagadas-personal", icon: Percent, roles: [1, 2, 11] },
      { label: "Pagadas — Profesional", href: "/comisiones/pagadas-profesional", icon: Percent, roles: [1, 2, 11] },
    ],
  },
  {
    id: "sesiones",
    label: "Sesiones",
    items: [
      { label: "Por Atender", href: "/sesiones/por-atender", icon: CalendarClock, roles: [1, 2, 7, 10] },
      { label: "Atendidos", href: "/sesiones/atendidos", icon: CalendarClock, roles: [1, 2, 7, 10] },
    ],
  },
  {
    id: "resultados",
    label: "Resultados",
    items: [
      { label: "Pendientes — Servicio", href: "/resultados/pendientes-servicio", icon: FileCheck2, roles: [1, 2, 7, 10] },
      { label: "Pendientes — Laboratorio", href: "/resultados/pendientes-laboratorio", icon: FileCheck2, roles: [1, 2, 7, 10] },
      { label: "Guardados — Servicio", href: "/resultados/guardados-servicio", icon: FileCheck2, roles: [1, 2, 7, 10] },
      { label: "Guardados — Laboratorio", href: "/resultados/guardados-laboratorio", icon: FileCheck2, roles: [1, 2, 7, 10] },
    ],
  },
  {
    id: "consultas",
    label: "Consultas",
    items: [
      { label: "Lista de Consultas", href: "/consultas/lista", icon: NotebookPen, roles: [1, 2, 10] },
      { label: "Ver Historias", href: "/consultas/historias", icon: NotebookPen, roles: [1, 2, 7, 10] },
      { label: "Ver Controles", href: "/consultas/controles", icon: NotebookPen, roles: [1, 2, 7, 10] },
    ],
  },
  {
    id: "metodos",
    label: "Métodos Anticonceptivos",
    items: [
      { label: "Lista de Métodos", href: "/metodos/lista", icon: ShieldPlus, roles: [1, 2, 7, 10] },
      { label: "Pacientes por Llamar", href: "/metodos/por-llamar", icon: ShieldPlus, roles: [1, 2, 7, 10] },
    ],
  },
  {
    id: "visitador",
    label: "Visitador",
    items: [
      { label: "Visitas", href: "/visitador/visitas", icon: Route, roles: [1, 11] },
      { label: "Comisiones por Entregar", href: "/visitador/por-entregar", icon: Route, roles: [1, 11] },
      { label: "Comisiones Entregadas", href: "/visitador/entregadas", icon: Route, roles: [1, 11] },
      { label: "Cumpleaños", href: "/visitador/cumpleanos", icon: Route, roles: [1, 11] },
    ],
  },
  {
    id: "existencias",
    label: "Existencias",
    items: [
      { label: "Productos", href: "/existencias/productos", icon: Warehouse, roles: [1] },
      { label: "Ingresos", href: "/existencias/ingresos", icon: Warehouse, roles: [1] },
      { label: "Ventas", href: "/existencias/ventas", icon: Warehouse, roles: [1] },
    ],
  },
  {
    id: "reportes",
    label: "Reportes",
    items: [
      { label: "Reporte Total", href: "/reportes/total", icon: BarChartBig, roles: [1, 2] },
      { label: "Detallado por Sede", href: "/reportes/detallado", icon: BarChartBig, roles: [1, 2] },
      { label: "Detallado Sede C", href: "/reportes/detallado-c", icon: BarChartBig, roles: [1, 12] },
      { label: "Cierre de Caja", href: "/reportes/cierre-caja", icon: BarChartBig, roles: [1, 2, 7] },
      { label: "Historial de Pacientes", href: "/reportes/historial-pacientes", icon: BarChartBig, roles: [1, 2, 7, 10] },
      { label: "Producción", href: "/reportes/produccion", icon: BarChartBig, roles: [1, 2] },
    ],
  },
  {
    id: "creditos",
    label: "Créditos",
    items: [
      { label: "Créditos B", href: "/creditos/b", icon: CreditCard, roles: [1, 2] },
      { label: "Créditos C", href: "/creditos/c", icon: CreditCard, roles: [1, 2, 12] },
    ],
  },
  {
    id: "anotaciones",
    label: "Anotaciones",
    items: [
      { label: "Lista", href: "/anotaciones", icon: StickyNote, roles: [1, 7, 10] },
    ],
  },
  {
    id: "administrativo",
    label: "Administrativo",
    items: [
      { label: "Usuarios", href: "/administrativo/usuarios", icon: Users, roles: [1] },
      { label: "Roles", href: "/administrativo/roles", icon: ShieldCheck, roles: [1] },
      { label: "Activos", href: "/administrativo/activos", icon: MonitorSmartphone, roles: [1] },
      { label: "Cambiar Contraseña", href: "/administrativo/contrasena", icon: KeyRound, roles: ALL },
    ],
  },
];

/** Devuelve el menú filtrado para un rol (grupos sin items se omiten). */
export function navForRole(roleId: RoleId): NavGroup[] {
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.roles.includes(roleId)),
  })).filter((g) => g.items.length > 0);
}

const ALL_ITEMS: NavItem[] = NAV.flatMap((g) => g.items);

/** Busca un item por href exacto (para títulos/breadcrumbs). */
export function findNavItem(href: string): NavItem | undefined {
  return ALL_ITEMS.find((i) => i.href === href);
}

/** Etiqueta del grupo al que pertenece un href. */
export function groupLabelForHref(href: string): string | null {
  const g = NAV.find((g) => g.items.some((i) => i.href === href));
  return g?.label ?? null;
}
