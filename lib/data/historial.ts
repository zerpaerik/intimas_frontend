/** Historial clínico simulado por paciente (determinista a partir del id). */

export interface Antecedentes {
  alergias: string;
  patologicos: string;
  familiares: string;
  grupoSanguineo: string;
  fur?: string;
  metodoActual?: string;
}

export interface AtencionPrevia {
  fecha: string;
  items: string[];
  profesional: string;
  monto: number;
  estado: "Pagado" | "Pendiente";
}

export interface HistoriaClinica {
  fecha: string;
  especialidad: string;
  diagnostico: string;
  especialista: string;
}

export interface ResultadoPrevio {
  fecha: string;
  nombre: string;
  tipo: "Laboratorio" | "Servicio";
  estado: string;
}

export interface Historial {
  antecedentes: Antecedentes;
  atenciones: AtencionPrevia[];
  historias: HistoriaClinica[];
  resultados: ResultadoPrevio[];
}

const GRUPOS = ["O+", "A+", "B+", "O-", "A-", "AB+"];
const FECHAS = ["2026-05-28", "2026-05-12", "2026-04-20", "2026-03-15", "2026-02-08", "2026-01-19"];
const ESPECIALISTAS = ["Dra. Núñez", "Dr. Aguilar", "Dra. Vargas", "Dra. Rojas", "Dr. Espinoza"];

const ALERGIAS = ["Ninguna conocida", "Penicilina", "AINEs", "Ninguna conocida", "Sulfas"];
const PATOLOGICOS = ["Sin antecedentes relevantes", "Hipertensión controlada", "Anemia leve", "Sin antecedentes relevantes", "Migraña"];
const FAMILIARES = ["Madre con diabetes tipo 2", "Sin antecedentes", "Padre hipertenso", "Cáncer de mama (tía)", "Sin antecedentes"];
const METODOS = ["Ninguno", "Inyectable mensual", "DIU", "Píldoras", "Implante subdérmico"];

const ATENCION_ITEMS = [
  ["Ecografía obstétrica", "Consulta ginecológica"],
  ["Papanicolaou"],
  ["Hemograma completo", "Examen de orina"],
  ["Consulta ginecológica"],
  ["Ecografía transvaginal", "Perfil hormonal"],
  ["Control prenatal"],
];

const DIAGNOSTICOS = [
  "Embarazo de 12 semanas, control normal",
  "Infección urinaria baja",
  "Control ginecológico sin hallazgos",
  "Síndrome de ovario poliquístico",
  "Anemia ferropénica leve",
  "Control de método anticonceptivo",
];
const ESPECIALIDADES = ["Ginecología", "Obstetricia", "Medicina General"];

const RESULTADOS = [
  { nombre: "Hemograma completo", tipo: "Laboratorio" as const, estado: "Entregado" },
  { nombre: "Perfil hormonal", tipo: "Laboratorio" as const, estado: "Entregado" },
  { nombre: "Ecografía obstétrica", tipo: "Servicio" as const, estado: "Informado" },
  { nombre: "Examen de orina", tipo: "Laboratorio" as const, estado: "Entregado" },
  { nombre: "Papanicolaou", tipo: "Servicio" as const, estado: "En proceso" },
];

const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];

export function historialFor(id: number, sexo?: string): Historial {
  const esFemenino = (sexo ?? "Femenino") === "Femenino";
  const nAt = (id % 3) + 2; // 2-4 atenciones
  const nHist = (id % 2) + 1; // 1-2 historias
  const nRes = (id % 3) + 2; // 2-4 resultados

  const antecedentes: Antecedentes = {
    alergias: pick(ALERGIAS, id),
    patologicos: pick(PATOLOGICOS, id + 1),
    familiares: pick(FAMILIARES, id + 2),
    grupoSanguineo: pick(GRUPOS, id),
    ...(esFemenino
      ? { fur: pick(["2026-05-02", "2026-04-18", "2026-05-20", "2026-03-29"], id), metodoActual: pick(METODOS, id) }
      : {}),
  };

  const atenciones: AtencionPrevia[] = Array.from({ length: nAt }, (_, k) => ({
    fecha: pick(FECHAS, id + k),
    items: pick(ATENCION_ITEMS, id + k),
    profesional: pick(ESPECIALISTAS, id + k),
    monto: 60 + ((id + k) % 6) * 30,
    estado: (id + k) % 4 === 0 ? "Pendiente" : "Pagado",
  }));

  const historias: HistoriaClinica[] = Array.from({ length: nHist }, (_, k) => ({
    fecha: pick(FECHAS, id + k + 1),
    especialidad: pick(ESPECIALIDADES, id + k),
    diagnostico: pick(DIAGNOSTICOS, id + k),
    especialista: pick(ESPECIALISTAS, id + k + 2),
  }));

  const resultados: ResultadoPrevio[] = Array.from({ length: nRes }, (_, k) => ({
    fecha: pick(FECHAS, id + k + 2),
    ...pick(RESULTADOS, id + k),
  }));

  return { antecedentes, atenciones, historias, resultados };
}
