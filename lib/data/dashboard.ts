/** Datos simulados del dashboard (estáticos para evitar mismatches SSR). */

export interface IngresoPoint {
  dia: string;
  ingresos: number;
  gastos: number;
}

export const ingresosSerie: IngresoPoint[] = [
  { dia: "24", ingresos: 3850, gastos: 920 },
  { dia: "25", ingresos: 4200, gastos: 1100 },
  { dia: "26", ingresos: 3100, gastos: 760 },
  { dia: "27", ingresos: 5200, gastos: 1320 },
  { dia: "28", ingresos: 4800, gastos: 980 },
  { dia: "29", ingresos: 6100, gastos: 1500 },
  { dia: "30", ingresos: 2400, gastos: 640 },
  { dia: "31", ingresos: 4500, gastos: 1080 },
  { dia: "01", ingresos: 5300, gastos: 1240 },
  { dia: "02", ingresos: 4950, gastos: 1010 },
  { dia: "03", ingresos: 6400, gastos: 1580 },
  { dia: "04", ingresos: 5100, gastos: 1150 },
  { dia: "05", ingresos: 5800, gastos: 1290 },
  { dia: "06", ingresos: 6300, gastos: 1180 },
];

export interface PagoSlice {
  name: string;
  value: number;
  color: string;
}

export const pagosSerie: PagoSlice[] = [
  { name: "Efectivo", value: 4820, color: "#16a34a" },
  { name: "Yape", value: 3640, color: "#e6007e" },
  { name: "Tarjeta", value: 2150, color: "#0091d5" },
  { name: "Depósito", value: 1300, color: "#7c3aed" },
];

export interface ServicioTop {
  nombre: string;
  total: number;
}

export const topServicios: ServicioTop[] = [
  { nombre: "Ecografía obstétrica", total: 42 },
  { nombre: "Papanicolaou", total: 38 },
  { nombre: "Hemograma completo", total: 31 },
  { nombre: "Consulta ginecológica", total: 27 },
  { nombre: "Eco transvaginal", total: 22 },
  { nombre: "Perfil hormonal", total: 18 },
];

export interface ActivityItem {
  titulo: string;
  detalle: string;
  hora: string;
  color: string;
}

export const actividadReciente: ActivityItem[] = [
  { titulo: "Atención registrada", detalle: "María Flores · Ecografía obstétrica", hora: "10:42", color: "#e6007e" },
  { titulo: "Pago recibido", detalle: "S/ 180.00 · Yape", hora: "10:31", color: "#16a34a" },
  { titulo: "Resultado guardado", detalle: "Hemograma · Lab. Central", hora: "09:58", color: "#00b8a9" },
  { titulo: "Paciente nuevo", detalle: "Carlos Ramos · DNI 70215488", hora: "09:40", color: "#0091d5" },
  { titulo: "Cita de control", detalle: "Ana Quispe · Planificación", hora: "09:15", color: "#7c3aed" },
];

/** Pendientes mostrados según el rol activo. */
export const pendientesPorRol: Record<number, { titulo: string; items: string[] }> = {
  1: {
    titulo: "Pendientes del día",
    items: [
      "3 cierres de caja por revisar",
      "5 resultados de laboratorio sin entregar",
      "2 comisiones por aprobar",
    ],
  },
  2: {
    titulo: "Finanzas — pendientes",
    items: [
      "Cierre de caja turno mañana",
      "8 cuentas por cobrar vencen hoy",
      "Conciliar depósitos del fin de semana",
    ],
  },
  7: {
    titulo: "Clínica — pendientes",
    items: [
      "4 atenciones en espera",
      "2 historias clínicas por completar",
      "3 controles agendados para hoy",
    ],
  },
  10: {
    titulo: "Laboratorio — pendientes",
    items: [
      "6 muestras en proceso",
      "5 resultados por validar",
      "2 análisis con material pendiente",
    ],
  },
  11: {
    titulo: "Visitador — pendientes",
    items: [
      "S/ 1,250 en comisiones por entregar",
      "3 visitas programadas",
      "2 cumpleaños de profesionales esta semana",
    ],
  },
  12: {
    titulo: "Sede C — pendientes",
    items: [
      "Reporte detallado mensual",
      "Revisar créditos vencidos",
      "Cuadrar gastos de la sede",
    ],
  },
};
