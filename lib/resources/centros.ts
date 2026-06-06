import { Building2 } from "lucide-react";
import type { ResourceConfig } from "./types";

export const centros: ResourceConfig = {
  key: "centros",
  path: "/archivos/centros",
  singular: "Centro",
  plural: "Centros",
  article: "el",
  icon: Building2,
  description: "Centros médicos y sedes asociadas.",
  searchKeys: ["nombre", "direccion", "referencia"],
  titleKey: "nombre",
  subtitleKey: "direccion",
  columns: [
    { key: "nombre", header: "Centro", type: "primary", subKey: "direccion" },
    { key: "direccion", header: "Dirección", hideOnMobile: true },
    { key: "referencia", header: "Referencia", hideOnMobile: true },
  ],
  fields: [
    { name: "nombre", label: "Nombre del centro", type: "uppercase", required: true, span: 2 },
    { name: "direccion", label: "Dirección", type: "uppercase", span: 2 },
    { name: "referencia", label: "Referencia", type: "uppercase", span: 2 },
  ],
  seed: [
    { id: 1, nombre: "Sede Principal", direccion: "Av. Los Próceres 1200", referencia: "Frente al parque central" },
    { id: 2, nombre: "Intimas 2", direccion: "Jr. Comercio 540", referencia: "A media cuadra del mercado" },
    { id: 3, nombre: "Centro Médico Norte", direccion: "Av. Universitaria 2330", referencia: "Cruce con Av. Perú" },
    { id: 4, nombre: "Policlínico San Juan", direccion: "Calle Lima 88", referencia: "Costado de la municipalidad" },
    { id: 5, nombre: "Consultorio Santa Rosa", direccion: "Av. Salaverry 410", referencia: "Edificio Santa Rosa, piso 2" },
  ],
};
