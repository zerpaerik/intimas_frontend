/** Tipos de la API de atenciones (respuestas del backend NestJS). Montos llegan como Decimal (string); usar Number() al operar. */

export type AtnEstado = "Pagado" | "Parcial" | "Pendiente";

export const METODOS_PAGO = ["Efectivo", "Tarjeta", "Depósito", "Yape"];

export interface AtnItem {
  id?: number;
  kind: string;
  nombre: string;
  monto: number;
}

export interface Pago {
  id: number;
  monto: number;
  metodo: string;
  tipo: string; // ABONO_INICIAL | COBRO
  fecha: string;
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
  pagado: number;
  saldo: number;
  estado: AtnEstado;
  pagos: Pago[];
  anulada: boolean;
  anuladaAt?: string | null;
  motivoAnulacion?: string | null;
  anuladaPor?: { id: number; nombre: string } | null;
  usuario?: { id: number; nombre: string } | null;
  sedeId?: number | null;
  sede?: { id: number; nombre: string } | null;
  items: AtnItem[];
  consultas?: AtnConsulta[];
}

export interface AtnConsulta {
  id: number;
  tipoNombre: string;
  estado: string;
  prenatal: boolean;
  pediatrico?: boolean;
  especialista?: { id: number; nombres: string; apellidos: string } | null;
  historia?: { id: number } | null;
  control?: { id: number } | null;
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}
