// Tipos de los reportes agregados (backend NestJS).

export interface PorServicioRow {
  kind: string;
  nombre: string;
  cantidad: number;
  monto: number;
}
export interface PorTipoRow {
  kind: string;
  cantidad: number;
  monto: number;
}
export interface PorServicioResponse {
  porServicio: PorServicioRow[];
  porTipo: PorTipoRow[];
  total: { cantidad: number; monto: number };
}

export interface ProfProduccion {
  profesionalId: number | null;
  profesional: string;
  cantidad: number;
}
export interface PorProfesionalResponse {
  consultasPorProfesional: ProfProduccion[];
  ecografiasPorProfesional: ProfProduccion[];
}
