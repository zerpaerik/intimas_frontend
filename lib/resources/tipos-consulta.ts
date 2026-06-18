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
  derive: (r) => ({ formato: r.pediatrico ? "Pediátrica" : r.prenatal ? "Prenatal" : "General" }),
  columns: [
    { key: "nombre", header: "Tipo de consulta", type: "primary", subKey: "especialidad" },
    { key: "especialidad", header: "Especialidad", hideOnMobile: true },
    { key: "precio", header: "Precio", type: "currency" },
    { key: "formato", header: "Formato", type: "badge", colorMap: { Prenatal: "#993556", "Pediátrica": "#0c447c", General: "#94a3b8" } },
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
    {
      name: "pediatrico",
      label: "¿Es historia pediátrica?",
      type: "select",
      span: 1,
      help: "Si es pediátrica, al atender se registra una historia clínica pediátrica (formato de niños).",
      options: [
        { value: "false", label: "No" },
        { value: "true", label: "Sí (historia pediátrica)" },
      ],
    },
  ],
  seed: [
    { id: 1, nombre: "Consulta ginecológica", especialidad: "Ginecología", precio: 60, prenatal: false },
    { id: 2, nombre: "Control prenatal", especialidad: "Obstetricia", precio: 50, prenatal: true },
    { id: 3, nombre: "Consulta psicológica", especialidad: "Psicología", precio: 120, prenatal: false },
    { id: 4, nombre: "Medicina general", especialidad: "Medicina General", precio: 40, prenatal: false },
    { id: 5, nombre: "Consulta nutricional", especialidad: "Nutrición", precio: 70, prenatal: false },
    { id: 6, nombre: "Consulta pediátrica", especialidad: "Pediatría", precio: 55, prenatal: false, pediatrico: true },
  ],
};
