import { Microscope } from "lucide-react";
import type { ResourceConfig } from "./types";

export const laboratorio: ResourceConfig = {
  key: "laboratorio",
  path: "/archivos/laboratorio",
  singular: "Laboratorio",
  plural: "Laboratorios",
  article: "el",
  icon: Microscope,
  description: "Laboratorios donde se procesan los análisis.",
  searchKeys: ["nombre", "direccion", "referencia"],
  titleKey: "nombre",
  subtitleKey: "direccion",
  columns: [
    { key: "nombre", header: "Laboratorio", type: "primary", subKey: "direccion" },
    { key: "direccion", header: "Dirección", hideOnMobile: true },
    { key: "referencia", header: "Referencia", hideOnMobile: true },
  ],
  fields: [
    { name: "nombre", label: "Nombre del laboratorio", type: "uppercase", required: true, span: 2 },
    { name: "direccion", label: "Dirección", type: "uppercase", span: 2 },
    { name: "referencia", label: "Referencia", type: "uppercase", span: 2 },
  ],
  seed: [
    { id: 1, nombre: "Laboratorio Central Intimas", direccion: "Av. Los Próceres 1200, sótano", referencia: "Dentro de la Sede Principal" },
    { id: 2, nombre: "Lab. Referencia BioAnálisis", direccion: "Av. Brasil 980", referencia: "Convenio externo" },
    { id: 3, nombre: "Patología Molecular S.A.C.", direccion: "Calle Las Begonias 320", referencia: "Solo pruebas especializadas" },
    { id: 4, nombre: "Lab. Intimas 2", direccion: "Jr. Comercio 540, piso 1", referencia: "Toma de muestras" },
  ],
};
