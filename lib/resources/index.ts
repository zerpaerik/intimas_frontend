import { pacientes } from "./pacientes";
import { servicios } from "./servicios";
import { analisis } from "./analisis";
import { profesionales } from "./profesionales";
import { laboratorio } from "./laboratorio";
import { paquetes } from "./paquetes";
import { personal } from "./personal";
import { centros } from "./centros";
import { productos } from "./productos";
import { material } from "./material";
import { usuarios } from "./usuarios";
import type { ResourceConfig } from "./types";

/** Orden de los maestros (coincide con el menú Archivo). */
export const RESOURCES: ResourceConfig[] = [
  pacientes,
  profesionales,
  servicios,
  analisis,
  laboratorio,
  paquetes,
  personal,
  centros,
  productos,
  material,
];

/** Recursos fuera del menú Archivo (p. ej. Administrativo). */
export const EXTRA_RESOURCES: ResourceConfig[] = [usuarios];

export const RESOURCE_MAP: Record<string, ResourceConfig> = Object.fromEntries(
  [...RESOURCES, ...EXTRA_RESOURCES].map((r) => [r.key, r]),
);

export function getResource(key: string): ResourceConfig | undefined {
  return RESOURCE_MAP[key];
}

/** Mapea la clave del recurso al segmento del endpoint en la API. */
const ENDPOINT_OVERRIDES: Record<string, string> = {
  laboratorio: "laboratorios",
};
export function endpointFor(key: string): string {
  return ENDPOINT_OVERRIDES[key] ?? key;
}

export type { ResourceConfig } from "./types";
export type { Row, FieldDef, ColumnDef } from "./types";
