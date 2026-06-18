/** Tipos de la API clínica: consultas, historias (formato Intimas) y controles prenatales. */

export type ConsultaEstado = "Pendiente" | "Atendida";

export interface ConsultaPaciente {
  id: number;
  nombres: string;
  apellidos: string;
  tipoDoc?: string | null;
  numDoc?: string | null;
  sexo?: string | null;
  fechaNacimiento?: string | null;
  telefono?: string | null;
  facebook?: string | null;
  // Antecedentes reutilizables
  antPersonales?: string | null;
  antFamiliares?: string | null;
  antEpidemiologicos?: string | null;
  antQuirurgicos?: string | null;
  antOtros?: string | null;
  familiarNombre?: string | null;
  familiarParentesco?: string | null;
  familiarDni?: string | null;
}

export interface ConsultaEspecialista {
  id: number;
  nombres: string;
  apellidos: string;
  especialidad?: string | null;
  cmp?: string | null;
  consultorio?: string | null;
  turno?: string | null;
  codigoSalud?: string | null;
}

export interface Diagnostico {
  id?: number;
  cie10: string;
  descripcion?: string | null;
}

export interface Tratamiento {
  id?: number;
  medicamento: string;
  presentacion?: string | null;
  cantidad?: string | null;
  dosis?: string | null;
  dias?: string | null;
}

export interface HistoriaClinica {
  id: number;
  consultaId: number;
  pacienteId: number;
  especialistaId?: number | null;
  fecha: string;
  enfInicio?: string | null;
  enfCurso?: string | null;
  enfRelato?: string | null;
  peso?: string | null;
  fc?: string | null;
  fr?: string | null;
  presionArterial?: string | null;
  talla?: string | null;
  temperatura?: string | null;
  examenGeneral?: string | null;
  procedimientos?: string | null;
  observaciones?: string | null;
  diagnosticos?: Diagnostico[];
  tratamientos?: Tratamiento[];
  cerrada?: boolean;
  fechaCierre?: string | null;
}

export interface ControlPrenatal {
  id: number;
  consultaId: number;
  gestacionId?: number | null;
  pacienteId: number;
  especialistaId?: number | null;
  fecha: string;
  semanaGestacional?: number | null;
  peso?: string | null;
  temperatura?: string | null;
  presionArterial?: string | null;
  pulso?: string | null;
  alturaUterina?: string | null;
  presentacion?: string | null;
  fcf?: string | null;
  movimientosFetales?: string | null;
  edema?: string | null;
  consejeria?: string | null;
  sulfatoFerroso?: string | null;
  perfilBiofisico?: string | null;
  serologia?: string | null;
  glucosa?: string | null;
  vih?: string | null;
  hemoglobina?: string | null;
  examenFisico?: string | null;
  diagnostico?: string | null;
  diagDefinitivo?: string | null;
  exAux?: string | null;
  plan?: string | null;
  proximaCita?: string | null;
  observaciones?: string | null;
  cerrada?: boolean;
  fechaCierre?: string | null;
}

export interface HistoriaPediatrica {
  id: number;
  consultaId: number;
  pacienteId: number;
  especialistaId?: number | null;
  fecha: string;
  // 1 · Identificación
  cama?: string | null;
  informante?: string | null;
  lugarNacimiento?: string | null;
  procedencia?: string | null;
  seguro?: string | null;
  madreNombre?: string | null;
  padreNombre?: string | null;
  servicioIngreso?: string | null;
  referido?: string | null;
  // 2 · Enfermedad actual
  motivoConsulta?: string | null;
  tiempoEnfermedad?: string | null;
  formaInicio?: string | null;
  relato?: string | null;
  datosNegativos?: string | null;
  funcionesBiologicas?: string | null;
  revisionSistemas?: string | null;
  // 3 · Antecedentes
  antPerinatales?: string | null;
  pesoNacer?: string | null;
  tallaNacer?: string | null;
  apgar?: string | null;
  antNutricionales?: string | null;
  desarrollo?: string | null;
  escolaridad?: string | null;
  inmunizaciones?: string | null;
  antPatologicos?: string | null;
  antFamiliares?: string | null;
  antSocioeconomicos?: string | null;
  // 7 · Examen físico
  peso?: string | null;
  talla?: string | null;
  pc?: string | null;
  perimetroAbdominal?: string | null;
  imc?: string | null;
  fc?: string | null;
  fr?: string | null;
  ta?: string | null;
  temperatura?: string | null;
  percentiles?: string | null;
  inspeccionGeneral?: string | null;
  // 10-12 · Diagnóstico y planes
  dxPatologia?: string | null;
  dxCrecimiento?: string | null;
  planEstudio?: string | null;
  planManejo?: string | null;
  cerrada?: boolean;
  fechaCierre?: string | null;
}

export interface Gestacion {
  id: number;
  pacienteId: number;
  estado: string;
  gestas?: number | null;
  partos?: number | null;
  abortos?: number | null;
  cesareas?: number | null;
  vaginales?: number | null;
  nacidosVivos?: number | null;
  viven?: number | null;
  nacidosMuertos?: number | null;
  fum?: string | null;
  fpp?: string | null;
  ecoeg?: string | null;
  tipoSangre?: string | null;
  factorRh?: string | null;
  orina?: string | null;
  urea?: string | null;
  creatinina?: string | null;
  bk?: string | null;
  torch?: string | null;
  observaciones?: string | null;
  fechaCierre?: string | null;
  motivoCierre?: string | null;
  controles?: ControlPrenatal[];
}

export interface Carne {
  gestacion: Gestacion | null;
  controles: ControlPrenatal[];
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
  pediatrico?: boolean;
  especialistaId?: number | null;
  especialista?: ConsultaEspecialista | null;
  estado: ConsultaEstado;
  historia?: HistoriaClinica | null;
  control?: (ControlPrenatal & { gestacion?: Gestacion | null }) | null;
  pediatrica?: HistoriaPediatrica | null;
}

export interface Cie10 {
  codigo: string;
  descripcion: string;
}

/** ¿La consulta usa el formato/branding de ginecología? */
export function esGineco(c: { especialidad?: string | null; tipoNombre?: string }): boolean {
  const s = `${c.especialidad ?? ""} ${c.tipoNombre ?? ""}`.toLowerCase();
  return s.includes("gineco") || s.includes("obstet") || s.includes("prenatal");
}
