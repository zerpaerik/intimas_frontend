/** Tipos de la API de Caja (sesiones de caja: apertura, arqueo, cierre). */

export const METODOS_CAJA = ["Efectivo", "Tarjeta", "Yape", "Depósito"] as const;

export interface CajaResumen {
  montoInicial: number;
  ingresos: Record<string, number>;
  gastos: Record<string, number>;
  esperado: Record<string, number>;
  totalIngresos: number;
  totalGastos: number;
  neto: number;
}

export interface CajaArqueo {
  montoInicial: number;
  ingresos: Record<string, number>;
  gastos: Record<string, number>;
  esperado: Record<string, number>;
  contado: Record<string, number>;
  diferencia: Record<string, number>;
}

export interface CajaSesion {
  id: number;
  usuarioId: number;
  usuario?: { id: number; nombre: string } | null;
  sedeId?: number | null;
  sede?: { id: number; nombre: string } | null;
  estado: "Abierta" | "Cerrada";
  montoInicial: number | string;
  observacionApertura?: string | null;
  fechaApertura: string;
  fechaCierre?: string | null;
  cerradaPor?: { id: number; nombre: string } | null;
  observacionCierre?: string | null;
  arqueo?: CajaArqueo | null;
  totalIngresos?: number | string | null;
  totalGastos?: number | string | null;
  totalDiferencia?: number | string | null;
}

export interface CajaActual {
  caja: CajaSesion | null;
  resumen?: CajaResumen;
  cantidadPagos?: number;
  cantidadGastos?: number;
}

export interface CajaMovPago {
  id: number;
  monto: number | string;
  metodo: string;
  tipo: string;
  fecha: string;
  anulado: boolean;
  atencion?: { id: number; paciente?: { nombres: string; apellidos: string } | null } | null;
}
export interface CajaMovGasto {
  id: number;
  monto: number | string;
  metodo: string;
  descripcion: string;
  fecha: string;
  anulada: boolean;
}

export interface CajaDetalle {
  caja: CajaSesion;
  resumen: CajaResumen;
  pagos: CajaMovPago[];
  gastos: CajaMovGasto[];
  porTipoServicio?: Record<string, number>;
}
