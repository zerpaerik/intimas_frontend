/** Tipos de la API de atenciones (respuestas del backend NestJS). */

export type AtnEstado = "Pagado" | "Parcial" | "Pendiente";

export interface AtnItem {
  id?: number;
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
  tipoDoc?: string;
  numDoc?: string;
  sexo?: string;
  fechaNacimiento?: string | null;
  telefono?: string;
}

export interface Atencion {
  id: number;
  fecha: string;
  pacienteId: number;
  paciente: AtnPaciente;
  origenTipo: string;
  origenValor?: string;
  observaciones?: string;
  total: number;
  abono: number;
  saldo: number;
  estado: AtnEstado;
  usuario?: { id: number; nombre: string } | null;
  items: AtnItem[];
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
