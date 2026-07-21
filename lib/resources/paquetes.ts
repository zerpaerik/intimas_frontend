import { PackageOpen } from "lucide-react";
import type { ResourceConfig, Row } from "./types";

export const paquetes: ResourceConfig = {
  key: "paquetes",
  path: "/archivos/paquetes",
  singular: "Paquete",
  plural: "Paquetes",
  article: "el",
  icon: PackageOpen,
  description: "Paquetes que agrupan servicios y análisis a precio especial.",
  searchKeys: ["nombre"],
  titleKey: "nombre",
  subtitleKey: "_incluye",
  derive: (r) => {
    const servicios = (r.servicios as string[]) ?? [];
    const analisis = (r.analisis as string[]) ?? [];
    return {
      _incluye: `${servicios.length} servicio(s) · ${analisis.length} análisis`,
    };
  },
  columns: [
    { key: "nombre", header: "Paquete", type: "primary", subKey: "_incluye" },
    { key: "precio", header: "Precio", type: "currency" },
    { key: "consultas", header: "Consultas", hideOnMobile: true },
  ],
  fields: [
    { name: "nombre", label: "Nombre del paquete", type: "uppercase", required: true, span: 2 },
    { name: "precio", label: "Precio (S/)", type: "currency", required: true, span: 1 },
    { name: "consultas", label: "N° de consultas", type: "number", span: 1 },
    { name: "servicios", label: "Servicios incluidos", type: "multiselect", optionsFrom: "servicios", span: 2 },
    { name: "analisis", label: "Análisis incluidos", type: "multiselect", optionsFrom: "analisis", span: 2 },
  ],
  seed: [
    {
      id: 1,
      nombre: "Paquete Prenatal Básico",
      precio: 250,
      porcentaje: 30,
      consultas: 3,
      controles: 2,
      servicios: ["Ecografía obstétrica", "Consulta ginecológica"],
      analisis: ["Hemograma completo", "Examen completo de orina"],
    } as Row,
    {
      id: 2,
      nombre: "Paquete Control Ginecológico",
      precio: 180,
      porcentaje: 28,
      consultas: 2,
      controles: 1,
      servicios: ["Papanicolaou", "Ecografía transvaginal"],
      analisis: ["Perfil hormonal"],
    } as Row,
    {
      id: 3,
      nombre: "Paquete Fertilidad",
      precio: 420,
      porcentaje: 32,
      consultas: 2,
      controles: 2,
      servicios: ["Ecografía transvaginal"],
      analisis: ["Perfil hormonal", "TSH"],
    } as Row,
    {
      id: 4,
      nombre: "Paquete Chequeo Mujer",
      precio: 320,
      porcentaje: 30,
      consultas: 1,
      controles: 1,
      servicios: ["Ecografía mamaria", "Papanicolaou"],
      analisis: ["Hemograma completo", "Perfil lipídico"],
    } as Row,
    {
      id: 5,
      nombre: "Paquete Salud Integral",
      precio: 200,
      porcentaje: 26,
      consultas: 1,
      controles: 0,
      servicios: ["Consulta ginecológica"],
      analisis: ["Glucosa basal", "Perfil lipídico", "Hemograma completo"],
    } as Row,
  ],
};
