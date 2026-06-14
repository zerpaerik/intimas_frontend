import { NotebookPen } from "lucide-react";
import type { ResourceConfig } from "./types";

export const tiposConsulta: ResourceConfig = {
  key: "tipos-consulta",
  path: "/archivos/tipos-consulta",
  singular: "Tipo de consulta",
  plural: "Tipos de consulta",
  article: "el",
  icon: NotebookPen,
  description: "Tipos de consulta (ginecológica, control prenatal, etc.) con su precio.",
  searchKeys: ["nombre", "especialidad"],
  titleKey: "nombre",
  subtitleKey: "especialidad",
  derive: (r) => ({ prenatalLabel: r.prenatal ? "Sí" : "No" }),
  columns: [
    { key: "nombre", header: "Tipo de consulta", type: "primary", subKey: "especialidad" },
    { key: "especialidad", header: "Especialidad", hideOnMobile: true },
    { key: "precio", header: "Precio", type: "currency" },
    { key: "prenatalLabel", header: "Prenatal", type: "badge", colorMap: { "Sí": "#e6007e", No: "#94a3b8" } },
  ],
  fields: [
    { name: "nombre", label: "Nombre del tipo", type: "uppercase", required: true, span: 2 },
    { name: "especialidad", label: "Especialidad", type: "text", span: 1 },
    { name: "precio", label: "Precio (S/)", type: "currency", required: true, span: 1 },
    {
      name: "prenatal",
      label: "¿Es control prenatal?",
      type: "select",
      span: 1,
      help: "Si es prenatal, al atender se registra un Control prenatal en lugar de una historia clínica.",
      options: [
        { value: "false", label: "No" },
        { value: "true", label: "Sí (control prenatal)" },
      ],
    },
  ],
  seed: [
    { id: 1, nombre: "Consulta ginecológica", especialidad: "Ginecología", precio: 60, prenatal: false },
    { id: 2, nombre: "Control prenatal", especialidad: "Obstetricia", precio: 50, prenatal: true },
    { id: 3, nombre: "Consulta psicológica", especialidad: "Psicología", precio: 120, prenatal: false },
    { id: 4, nombre: "Medicina general", especialidad: "Medicina General", precio: 40, prenatal: false },
    { id: 5, nombre: "Consulta nutricional", especialidad: "Nutrición", precio: 70, prenatal: false },
  ],
};
