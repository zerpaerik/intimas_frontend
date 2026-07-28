export interface CitaPaciente {
  id: number;
  nombres: string;
  apellidos: string;
  tipoDoc?: string | null;
  numDoc?: string | null;
  telefono?: string | null;
}
export interface CitaMedico {
  id: number;
  nombre: string;
  colegiatura?: string | null;
}
export interface Cita {
  id: number;
  pacienteId: number;
  paciente?: CitaPaciente | null;
  medicoId: number;
  medico?: CitaMedico | null;
  sedeId?: number | null;
  sede?: { id: number; nombre: string } | null;
  fecha: string;
  hora: string;
  motivo?: string | null;
  monto: number | string;
  metodoPago?: string | null;
  estadoPago: string; // Pagado | Pendiente
  estado: string; // Programada | Asistió | No asistió | Cancelada
  observaciones?: string | null;
}

export const CITA_ESTADOS = ["Programada", "Asistió", "No asistió", "Cancelada"] as const;

export const CITA_ESTADO_COLOR: Record<string, string> = {
  Programada: "#0091d5",
  "Asistió": "#16a34a",
  "No asistió": "#ef4444",
  Cancelada: "#94a3b8",
};
