/** "Otros ingresos": dinero que no proviene de una atención. Se guardan como Pago
 *  (tipo OTRO_INGRESO) y cuentan en caja y reportes como cualquier ingreso. */
export interface OtroIngreso {
  id: number;
  concepto?: string | null;
  monto: number | string;
  metodo: string;
  fecha: string;
  anulado: boolean;
  sede?: { id: number; nombre: string } | null;
  usuario?: { id: number; nombre: string } | null;
}
