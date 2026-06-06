import { Activity } from "lucide-react";
import type { ResourceConfig } from "./types";

export const servicios: ResourceConfig = {
  key: "servicios",
  path: "/archivos/servicios",
  singular: "Servicio",
  plural: "Servicios",
  article: "el",
  icon: Activity,
  description: "Servicios médicos ofrecidos y su reparto de comisiones.",
  searchKeys: ["nombre", "tipo"],
  titleKey: "nombre",
  subtitleKey: "tipo",
  columns: [
    { key: "nombre", header: "Servicio", type: "primary", subKey: "tipo" },
    {
      key: "tipo",
      header: "Tipo",
      type: "badge",
      colorMap: {
        Ecografía: "#e6007e",
        "Rayos X": "#0091d5",
        "Salud Mental": "#7c3aed",
        Otros: "#00b8a9",
      },
    },
    { key: "precio", header: "Precio", type: "currency" },
    { key: "porcentajePers", header: "% Personal", type: "percent", hideOnMobile: true },
    { key: "porcentajeProf", header: "% Profesional", type: "percent", hideOnMobile: true },
    { key: "porcentajeTecn", header: "% Tecnólogo", type: "percent", hideOnMobile: true },
  ],
  fields: [
    { name: "nombre", label: "Nombre del servicio", type: "uppercase", required: true, span: 2 },
    {
      name: "tipo",
      label: "Tipo de servicio",
      type: "select",
      required: true,
      span: 1,
      options: ["Ecografía", "Rayos X", "Salud Mental", "Otros"].map((v) => ({ value: v, label: v })),
    },
    { name: "precio", label: "Precio (S/)", type: "currency", required: true, span: 1 },
    { name: "porcentajePers", label: "% Personal", type: "percent", span: 1 },
    { name: "porcentajeProf", label: "% Profesional", type: "percent", span: 1 },
    { name: "porcentajeTecn", label: "% Tecnólogo", type: "percent", span: 1 },
  ],
  seed: [
    { id: 1, nombre: "Ecografía obstétrica", tipo: "Ecografía", precio: 80, porcentajePers: 10, porcentajeProf: 40, porcentajeTecn: 0 },
    { id: 2, nombre: "Ecografía transvaginal", tipo: "Ecografía", precio: 90, porcentajePers: 10, porcentajeProf: 45, porcentajeTecn: 0 },
    { id: 3, nombre: "Ecografía mamaria", tipo: "Ecografía", precio: 100, porcentajePers: 10, porcentajeProf: 45, porcentajeTecn: 0 },
    { id: 4, nombre: "Radiografía de tórax", tipo: "Rayos X", precio: 70, porcentajePers: 15, porcentajeProf: 0, porcentajeTecn: 30 },
    { id: 5, nombre: "Consulta psicológica", tipo: "Salud Mental", precio: 120, porcentajePers: 10, porcentajeProf: 50, porcentajeTecn: 0 },
    { id: 6, nombre: "Consulta ginecológica", tipo: "Otros", precio: 60, porcentajePers: 10, porcentajeProf: 50, porcentajeTecn: 0 },
    { id: 7, nombre: "Papanicolaou", tipo: "Otros", precio: 45, porcentajePers: 15, porcentajeProf: 20, porcentajeTecn: 20 },
    { id: 8, nombre: "Densitometría ósea", tipo: "Rayos X", precio: 130, porcentajePers: 10, porcentajeProf: 0, porcentajeTecn: 35 },
  ],
};
