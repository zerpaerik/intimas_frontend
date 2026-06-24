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
  derive: (r) => ({ formatoLabel: r.formato === "pediatrico" ? "Pediátrica" : r.formato === "prenatal" ? "Prenatal" : "General" }),
  columns: [
    { key: "nombre", header: "Tipo de consulta", type: "primary", subKey: "especialidad" },
    { key: "especialidad", header: "Especialidad", hideOnMobile: true },
    { key: "precio", header: "Precio", type: "currency" },
    { key: "formatoLabel", header: "Tipo de historia", type: "badge", colorMap: { Prenatal: "#993556", "Pediátrica": "#0c447c", General: "#94a3b8" } },
  ],
  fields: [
    { name: "nombre", label: "Nombre del tipo", type: "uppercase", required: true, span: 2 },
    { name: "especialidad", label: "Especialidad", type: "text", span: 1 },
    { name: "precio", label: "Precio (S/)", type: "currency", required: true, span: 1 },
    {
      name: "formato",
      label: "Tipo de historia que se carga",
      type: "select",
      span: 1,
      help: "Define qué formato se abre al atender esta consulta.",
      options: [
        { value: "general", label: "Historia clínica general" },
        { value: "prenatal", label: "Control prenatal (carné)" },
        { value: "pediatrico", label: "Historia pediátrica" },
      ],
    },
  ],
  seed: [
    { id: 1, nombre: "Consulta ginecológica", especialidad: "Ginecología", precio: 60, formato: "general" },
    { id: 2, nombre: "Control prenatal", especialidad: "Obstetricia", precio: 50, formato: "prenatal" },
    { id: 3, nombre: "Consulta psicológica", especialidad: "Psicología", precio: 120, formato: "general" },
    { id: 4, nombre: "Medicina general", especialidad: "Medicina General", precio: 40, formato: "general" },
    { id: 5, nombre: "Consulta nutricional", especialidad: "Nutrición", precio: 70, formato: "general" },
    { id: 6, nombre: "Consulta pediátrica", especialidad: "Pediatría", precio: 55, formato: "pediatrico" },
  ],

};
