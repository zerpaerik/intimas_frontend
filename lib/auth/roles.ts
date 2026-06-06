/**
 * Roles, usuarios demo y sedes — basados en el sistema Laravel original.
 * Los IDs de rol coinciden con los del sistema real (1, 2, 7, 10, 11, 12).
 */

export type RoleId = 1 | 2 | 7 | 10 | 11 | 12;

export interface Role {
  id: RoleId;
  name: string;
  short: string;
  description: string;
  /** Color de marca para avatar/badge (hex). */
  color: string;
}

export const ROLES: Role[] = [
  {
    id: 1,
    name: "Administrador",
    short: "Admin",
    description: "Acceso total: configuración, finanzas, clínica y reportes.",
    color: "#e6007e",
  },
  {
    id: 2,
    name: "Admin. Financiero",
    short: "Finanzas",
    description: "Caja, cobros, gastos, comisiones e ingresos.",
    color: "#0091d5",
  },
  {
    id: 7,
    name: "Personal Clínico",
    short: "Clínico",
    description: "Atenciones, consultas, historias y métodos.",
    color: "#7c3aed",
  },
  {
    id: 10,
    name: "Técnico de Laboratorio",
    short: "Laboratorio",
    description: "Resultados, análisis y sesiones.",
    color: "#00b8a9",
  },
  {
    id: 11,
    name: "Visitador Médico",
    short: "Visitador",
    description: "Comisiones, visitas y cumpleaños de profesionales.",
    color: "#f5a623",
  },
  {
    id: 12,
    name: "Gerente Sede C",
    short: "Gerencia C",
    description: "Reportes, créditos y gastos de Sede C.",
    color: "#9b2d69",
  },
];

export function getRole(id: RoleId): Role {
  return ROLES.find((r) => r.id === id) ?? ROLES[0];
}

export interface Sede {
  id: number;
  name: string;
  short: string;
}

export const SEDES: Sede[] = [
  { id: 1, name: "Sede Principal", short: "Principal" },
  { id: 2, name: "Intimas 2", short: "Intimas 2" },
];

export function getSede(id: number): Sede {
  return SEDES.find((s) => s.id === id) ?? SEDES[0];
}

export interface DemoUser {
  id: number;
  name: string;
  email: string;
  roleId: RoleId;
  /** Cargo mostrado en el menú de usuario. */
  title: string;
}

/** Un usuario de demostración por rol. */
export const DEMO_USERS: DemoUser[] = [
  {
    id: 1,
    name: "Erik Zerpa",
    email: "admin@intimas.pe",
    roleId: 1,
    title: "Administrador General",
  },
  {
    id: 2,
    name: "Lucía Ramírez",
    email: "finanzas@intimas.pe",
    roleId: 2,
    title: "Jefa de Finanzas",
  },
  {
    id: 3,
    name: "Dra. Carmen Salas",
    email: "clinica@intimas.pe",
    roleId: 7,
    title: "Médico Tratante",
  },
  {
    id: 4,
    name: "José Quispe",
    email: "laboratorio@intimas.pe",
    roleId: 10,
    title: "Tecnólogo de Laboratorio",
  },
  {
    id: 5,
    name: "Marco Ruiz",
    email: "visitador@intimas.pe",
    roleId: 11,
    title: "Visitador Médico",
  },
  {
    id: 6,
    name: "Patricia León",
    email: "gerencia@intimas.pe",
    roleId: 12,
    title: "Gerente Sede C",
  },
];

export function demoUserForRole(roleId: RoleId): DemoUser {
  return (
    DEMO_USERS.find((u) => u.roleId === roleId) ?? DEMO_USERS[0]
  );
}

export function demoUserByEmail(email: string): DemoUser | undefined {
  return DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
}
