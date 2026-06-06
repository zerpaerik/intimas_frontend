import { Stethoscope } from "lucide-react";
import type { ResourceConfig } from "./types";

const ESPECIALIDADES = [
  "Ginecología",
  "Obstetricia",
  "Medicina General",
  "Ecografía",
  "Psicología",
  "Urología",
  "Pediatría",
  "Medicina Interna",
];

export const profesionales: ResourceConfig = {
  key: "profesionales",
  path: "/archivos/profesionales",
  singular: "Profesional",
  plural: "Profesionales",
  article: "el",
  icon: Stethoscope,
  description: "Médicos y especialistas que atienden en los consultorios.",
  searchKeys: ["nombres", "apellidos", "cmp", "especialidad", "centro"],
  titleKey: "_nombre",
  subtitleKey: "especialidad",
  derive: (r) => ({ _nombre: `${r.nombres ?? ""} ${r.apellidos ?? ""}`.trim() }),
  columns: [
    { key: "_nombre", header: "Profesional", type: "primary", subKey: "cmp" },
    {
      key: "especialidad",
      header: "Especialidad",
      type: "badge",
      colorMap: {
        Ginecología: "#e6007e",
        Obstetricia: "#9b2d69",
        Ecografía: "#0091d5",
        Psicología: "#7c3aed",
        Urología: "#00b8a9",
        "Medicina General": "#f5a623",
        Pediatría: "#16a34a",
        "Medicina Interna": "#64748b",
      },
    },
    { key: "centro", header: "Centro", hideOnMobile: true },
    { key: "telefono", header: "Teléfono", hideOnMobile: true },
  ],
  fields: [
    { name: "nombres", label: "Nombres", type: "uppercase", required: true, span: 1 },
    { name: "apellidos", label: "Apellidos", type: "uppercase", required: true, span: 1 },
    { name: "cmp", label: "CMP (colegiatura)", type: "uppercase", span: 1 },
    { name: "nacimiento", label: "Fecha de nacimiento", type: "date", span: 1 },
    {
      name: "especialidad",
      label: "Especialidad",
      type: "select",
      required: true,
      span: 1,
      options: ESPECIALIDADES.map((v) => ({ value: v, label: v })),
    },
    { name: "centro", label: "Centro", type: "select", optionsFrom: "centros", span: 1 },
    { name: "telefono", label: "Teléfono", type: "tel", span: 1 },
  ],
  seed: [
    { id: 1, nombres: "Patricia", apellidos: "Núñez Salinas", cmp: "CMP 45821", nacimiento: "1980-03-12", especialidad: "Ginecología", centro: "Sede Principal", telefono: "987112233" },
    { id: 2, nombres: "Roberto", apellidos: "Aguilar Pérez", cmp: "CMP 38120", nacimiento: "1975-08-22", especialidad: "Obstetricia", centro: "Sede Principal", telefono: "961445566" },
    { id: 3, nombres: "Elena", apellidos: "Vargas Loayza", cmp: "CMP 51209", nacimiento: "1988-11-05", especialidad: "Ecografía", centro: "Intimas 2", telefono: "934778899" },
    { id: 4, nombres: "Daniel", apellidos: "Espinoza Cruz", cmp: "CMP 42990", nacimiento: "1983-01-19", especialidad: "Urología", centro: "Intimas 2", telefono: "920334455" },
    { id: 5, nombres: "Sofía", apellidos: "Rojas Medina", cmp: "CPP 7781", nacimiento: "1990-06-30", especialidad: "Psicología", centro: "Sede Principal", telefono: "955667788" },
    { id: 6, nombres: "Miguel", apellidos: "Torres Campos", cmp: "CMP 33450", nacimiento: "1972-09-14", especialidad: "Medicina General", centro: "Centro Médico Norte", telefono: "913220099" },
    { id: 7, nombres: "Carla", apellidos: "Benites Flores", cmp: "CMP 60112", nacimiento: "1992-12-02", especialidad: "Pediatría", centro: "Sede Principal", telefono: "942889900" },
  ],
};
