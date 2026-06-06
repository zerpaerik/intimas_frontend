import { TestTubeDiagonal } from "lucide-react";
import type { ResourceConfig } from "./types";

export const analisis: ResourceConfig = {
  key: "analisis",
  path: "/archivos/analisis",
  singular: "Análisis",
  plural: "Análisis",
  article: "el",
  icon: TestTubeDiagonal,
  description: "Catálogo de análisis de laboratorio disponibles.",
  searchKeys: ["nombre", "material"],
  titleKey: "nombre",
  subtitleKey: "material",
  columns: [
    { key: "nombre", header: "Análisis", type: "primary", subKey: "material" },
    { key: "precio", header: "Precio", type: "currency" },
    { key: "costo", header: "Costo", type: "currency", hideOnMobile: true },
    { key: "porcentaje", header: "Margen", type: "percent", hideOnMobile: true },
    { key: "tiempo", header: "Entrega", hideOnMobile: true },
    {
      key: "material",
      header: "Material",
      type: "badge",
      colorMap: {
        Sangre: "#ef4444",
        Orina: "#f5a623",
        Suero: "#0091d5",
        Hisopado: "#7c3aed",
        Heces: "#9b2d69",
        Otro: "#00b8a9",
      },
    },
  ],
  fields: [
    { name: "nombre", label: "Nombre del análisis", type: "uppercase", required: true, span: 2 },
    { name: "precio", label: "Precio (S/)", type: "currency", required: true, span: 1 },
    { name: "costo", label: "Costo (S/)", type: "currency", span: 1 },
    { name: "porcentaje", label: "Margen (%)", type: "percent", span: 1 },
    { name: "tiempo", label: "Tiempo de entrega", type: "text", placeholder: "24 h", span: 1 },
    {
      name: "material",
      label: "Material requerido",
      type: "select",
      span: 2,
      options: ["Sangre", "Orina", "Suero", "Hisopado", "Heces", "Otro"].map((v) => ({ value: v, label: v })),
    },
  ],
  seed: [
    { id: 1, nombre: "Hemograma completo", precio: 35, costo: 12, porcentaje: 65, tiempo: "24 h", material: "Sangre" },
    { id: 2, nombre: "Perfil hormonal", precio: 120, costo: 55, porcentaje: 54, tiempo: "48 h", material: "Suero" },
    { id: 3, nombre: "Glucosa basal", precio: 15, costo: 5, porcentaje: 66, tiempo: "6 h", material: "Sangre" },
    { id: 4, nombre: "Perfil lipídico", precio: 45, costo: 18, porcentaje: 60, tiempo: "24 h", material: "Suero" },
    { id: 5, nombre: "Examen completo de orina", precio: 20, costo: 6, porcentaje: 70, tiempo: "12 h", material: "Orina" },
    { id: 6, nombre: "Prueba de embarazo (β-HCG)", precio: 40, costo: 14, porcentaje: 65, tiempo: "24 h", material: "Sangre" },
    { id: 7, nombre: "TSH", precio: 50, costo: 22, porcentaje: 56, tiempo: "48 h", material: "Suero" },
    { id: 8, nombre: "Cultivo vaginal", precio: 60, costo: 25, porcentaje: 58, tiempo: "72 h", material: "Hisopado" },
  ],
};
