/** Tipos de la API clínica: consultas, historias y controles prenatales. */

export type ConsultaEstado = "Pendiente" | "Atendida";

export interface ConsultaPaciente {
  id: number;
  nombres: string;
  apellidos: string;
  numDoc?: string | null;
  sexo?: string | null;
  fechaNacimiento?: string | null;
}

export interface ConsultaEspecialista {
  id: number;
  nombres: string;
  apellidos: string;
  especialidad?: string | null;
}

export interface HistoriaClinica {
  id: number;
  consultaId: number;
  pacienteId: number;
  especialistaId?: number | null;
  fecha: string;
  motivo?: string | null;
  presionArterial?: string | null;
  pulso?: string | null;
  temperatura?: string | null;
  peso?: string | null;
  talla?: string | null;
  examenFisico?: string | null;
  diagnosticoPresuntivo?: string | null;
  diagnosticoDefinitivo?: string | null;
  cie?: string | null;
  plan?: string | null;
  observaciones?: string | null;
  proximaCita?: string | null;
}

export interface ControlPrenatal {
  id: number;
  consultaId: number;
  pacienteId: number;
  especialistaId?: number | null;
  fecha: string;
  semanaGestacional?: number | null;
  peso?: string | null;
  presionArterial?: string | null;
  fcf?: string | null;
  alturaUterina?: string | null;
  movimientosFetales?: string | null;
  edema?: string | null;
  examenFisico?: string | null;
  diagnostico?: string | null;
  plan?: string | null;
  proximaCita?: string | null;
  observaciones?: string | null;
}

export interface Consulta {
  id: number;
  fecha: string;
  pacienteId: number;
  paciente: ConsultaPaciente;
  atencionId?: number | null;
  tipoConsultaId?: number | null;
  tipoNombre: string;
  especialidad?: string | null;
  prenatal: boolean;
  especialistaId?: number | null;
  especialista?: ConsultaEspecialista | null;
  estado: ConsultaEstado;
  historia?: HistoriaClinica | null;
  control?: ControlPrenatal | null;
}

export interface AntecedenteObstetrico {
  id?: number;
  pacienteId: number;
  gestas?: number | null;
  partos?: number | null;
  abortos?: number | null;
  cesareas?: number | null;
  hijosVivos?: number | null;
  fum?: string | null;
  fpp?: string | null;
  tipoSangre?: string | null;
  observaciones?: string | null;
}
