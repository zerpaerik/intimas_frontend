/** Tipos de la API de gastos (egresos). Montos llegan como Decimal (string); usar Number() al operar. */

export interface Gasto {
  id: number;
  fecha: string;
  categoria?: string | null;
  descripcion: string;
  nota?: string | null;
  monto: number;
  metodo: string;
  proveedor?: string | null;
  sedeId?: number | null;
  anulada: boolean;
  anuladaAt?: string | null;
  motivoAnulacion?: string | null;
  sede?: { id: number; nombre: string } | null;
  usuario?: { id: number; nombre: string } | null;
}

export const CATEGORIAS_GASTO = [
  "Comisión",
  "Insumos",
  "Servicios (luz, agua, internet)",
  "Alquiler",
  "Sueldos y honorarios",
  "Mantenimiento",
  "Marketing",
  "Impuestos",
  "Transporte",
  "Otros",
];
