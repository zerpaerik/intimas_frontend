import { Contact } from "lucide-react";
import type { ResourceConfig } from "./types";

const TIPOS = [
  "Especialista",
  "Tecnólogo",
  "Prof. de Salud",
  "Recepcionista",
  "Mantenimiento",
  "Seguridad",
  "Otro",
];

export const personal: ResourceConfig = {
  key: "personal",
  path: "/archivos/personal",
  singular: "Personal",
  plural: "Personal",
  article: "el",
  icon: Contact,
  description: "Personal administrativo, técnico y de apoyo.",
  searchKeys: ["nombres", "apellidos", "dni", "cargo", "email"],
  titleKey: "_nombre",
  subtitleKey: "cargo",
  derive: (r) => ({ _nombre: `${r.nombres ?? ""} ${r.apellidos ?? ""}`.trim() }),
  columns: [
    { key: "_nombre", header: "Colaborador", type: "primary", subKey: "dni" },
    { key: "cargo", header: "Cargo", hideOnMobile: true },
    {
      key: "tipo",
      header: "Tipo",
      type: "badge",
      colorMap: {
        Especialista: "#e6007e",
        Tecnólogo: "#0091d5",
        "Prof. de Salud": "#7c3aed",
        Recepcionista: "#00b8a9",
        Mantenimiento: "#f5a623",
        Seguridad: "#64748b",
        Otro: "#94a3b8",
      },
    },
    { key: "telefono", header: "Teléfono", hideOnMobile: true },
  ],
  fields: [
    { name: "nombres", label: "Nombres", type: "uppercase", required: true, span: 1 },
    { name: "apellidos", label: "Apellidos", type: "uppercase", required: true, span: 1 },
    { name: "dni", label: "DNI", type: "text", required: true, span: 1 },
    { name: "cargo", label: "Cargo", type: "uppercase", span: 1 },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      required: true,
      span: 1,
      options: TIPOS.map((v) => ({ value: v, label: v })),
    },
    {
      name: "sesion",
      label: "¿Trabaja por sesión?",
      type: "select",
      span: 1,
      options: [
        { value: "No", label: "No" },
        { value: "Sí", label: "Sí" },
      ],
    },
    { name: "telefono", label: "Teléfono", type: "tel", span: 1 },
    { name: "email", label: "Correo electrónico", type: "email", span: 1 },
    { name: "direccion", label: "Dirección", type: "uppercase", span: 2 },
  ],
  seed: [
    { id: 1, nombres: "Gabriela", apellidos: "Paredes Soto", dni: "44210987", cargo: "Recepción", tipo: "Recepcionista", sesion: "No", telefono: "987001122", email: "gparedes@intimas.pe", direccion: "Av. Grau 220" },
    { id: 2, nombres: "Luis", apellidos: "Castillo Ramos", dni: "41887200", cargo: "Tecnólogo médico", tipo: "Tecnólogo", sesion: "Sí", telefono: "961334455", email: "lcastillo@intimas.pe", direccion: "Jr. Junín 410" },
    { id: 3, nombres: "Mónica", apellidos: "Flores Díaz", dni: "70554120", cargo: "Enfermera", tipo: "Prof. de Salud", sesion: "No", telefono: "934667788", email: "mflores@intimas.pe", direccion: "Calle Real 90" },
    { id: 4, nombres: "Andrés", apellidos: "Quiroz Lazo", dni: "42119876", cargo: "Mantenimiento", tipo: "Mantenimiento", sesion: "No", telefono: "920889911", email: "aquiroz@intimas.pe", direccion: "Av. Perú 1200" },
    { id: 5, nombres: "Teresa", apellidos: "Ramírez Acuña", dni: "45302188", cargo: "Caja", tipo: "Otro", sesion: "No", telefono: "955220011", email: "tramirez@intimas.pe", direccion: "Jr. Lima 33" },
    { id: 6, nombres: "Víctor", apellidos: "Sánchez Pérez", dni: "43771209", cargo: "Vigilancia", tipo: "Seguridad", sesion: "No", telefono: "913440022", email: "vsanchez@intimas.pe", direccion: "Av. Salaverry 700" },
  ],
};
