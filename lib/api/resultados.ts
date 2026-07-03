// Tipos y helpers del módulo de Resultados (laboratorio y servicios/ecografías).

export type Track = "lab" | "servicio";

export interface PlantillaInforme {
  id: number;
  nombre: string;
  tipo: string;
  cuerpo: string;
  activo?: boolean;
}

export interface ResultadoPaciente {
  id: number;
  nombres: string;
  apellidos: string;
  numDoc?: string | null;
  tipoDoc?: string | null;
  fechaNacimiento?: string | null;
  sexo?: string | null;
}

/** Ítem de atención pendiente de resultado. */
export interface ResultadoPendiente {
  itemId: number;
  kind: string;
  nombre: string;
  monto: number | string;
  atencionId: number;
  fecha: string;
  origenTipo?: string;
  origenValor?: string | null;
  paciente: ResultadoPaciente;
}

/** Contexto de un ítem para el editor de informe. */
export interface ResultadoContexto {
  itemId: number;
  kind: string;
  nombre: string;
  categoria: string | null;
  atencionId: number;
  fecha: string;
  origenTipo?: string;
  origenValor?: string | null;
  paciente: ResultadoPaciente;
  yaResuelto: boolean;
}

/** Resultado ya registrado (informe redactado o archivo adjunto). */
export interface Resultado {
  id: number;
  atencionItemId: number;
  atencionId: number;
  pacienteId: number;
  categoria: string;
  tipo?: string | null;
  nombre: string;
  estado: string;
  plantillaId?: number | null;
  informeHtml?: string | null;
  archivoNombre?: string | null;
  archivoMime?: string | null;
  archivoTamano?: number | null;
  archivoPath?: string | null;
  laboratorioId?: number | null;
  profesionalId?: number | null;
  observaciones?: string | null;
  fechaResultado: string;
  createdAt: string;
  paciente?: ResultadoPaciente | null;
  plantilla?: { id: number; nombre: string; tipo: string } | null;
  laboratorio?: { id: number; nombre: string } | null;
  profesional?: { id: number; nombres: string; apellidos: string; cmp?: string | null } | null;
  atencion?: { id: number; fecha: string; origenTipo?: string; origenValor?: string | null; sedeId?: number | null } | null;
  atencionItem?: { id: number; kind: string; nombre: string } | null;
}

/** true si el resultado es un archivo adjunto (vs. un informe redactado). */
export const esArchivo = (r: Pick<Resultado, "archivoPath">) => !!r.archivoPath;

export const trackLabel = (t: Track) => (t === "lab" ? "Laboratorio" : "Servicio");
