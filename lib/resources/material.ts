import { Droplets } from "lucide-react";
import type { ResourceConfig } from "./types";

export const material: ResourceConfig = {
  key: "material",
  path: "/archivos/material",
  singular: "Material",
  plural: "Materiales",
  article: "el",
  icon: Droplets,
  description: "Tipos de material usados en las pruebas de laboratorio.",
  searchKeys: ["nombre", "estatus"],
  titleKey: "nombre",
  subtitleKey: "estatus",
  columns: [
    { key: "nombre", header: "Material", type: "primary", subKey: "estatus" },
    {
      key: "estatus",
      header: "Estado",
      type: "badge",
      colorMap: { Disponible: "#16a34a", Agotado: "#ef4444" },
    },
  ],
  fields: [
    { name: "nombre", label: "Nombre del material", type: "uppercase", required: true, span: 2 },
    {
      name: "estatus",
      label: "Estado",
      type: "select",
      required: true,
      span: 2,
      options: [
        { value: "Disponible", label: "Disponible" },
        { value: "Agotado", label: "Agotado" },
      ],
    },
  ],
  seed: [
    { id: 1, nombre: "Sangre total", estatus: "Disponible" },
    { id: 2, nombre: "Suero", estatus: "Disponible" },
    { id: 3, nombre: "Orina", estatus: "Disponible" },
    { id: 4, nombre: "Hisopado vaginal", estatus: "Disponible" },
    { id: 5, nombre: "Heces", estatus: "Disponible" },
    { id: 6, nombre: "Plasma", estatus: "Agotado" },
  ],
};
