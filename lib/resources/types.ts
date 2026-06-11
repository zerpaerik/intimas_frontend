import type { LucideIcon } from "lucide-react";

export type Row = Record<string, unknown> & { id: number };

export type FieldType =
  | "text"
  | "uppercase"
  | "textarea"
  | "number"
  | "currency"
  | "percent"
  | "email"
  | "tel"
  | "password"
  | "date"
  | "select"
  | "multiselect";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  /** Opciones estáticas (enum) para select/multiselect. */
  options?: SelectOption[];
  /** Toma las opciones de otro recurso (por su nombre). */
  optionsFrom?: string;
  /** Ancho en la grilla del formulario. */
  span?: 1 | 2;
  help?: string;
  /** Oculta el campo al editar (p. ej. contraseña). */
  hideOnEdit?: boolean;
  /** Requerido solo al crear (no al editar). */
  requiredOnCreate?: boolean;
  /** Select con opciones estáticas que debe enviarse como número (FK). */
  numeric?: boolean;
}

export type ColumnType =
  | "primary"
  | "text"
  | "currency"
  | "percent"
  | "date"
  | "badge"
  | "tags"
  | "age";

export interface ColumnDef {
  key: string;
  header: string;
  type?: ColumnType;
  /** Segunda línea (para type "primary"). */
  subKey?: string;
  /** Para badges: mapa valor -> color hex. */
  colorMap?: Record<string, string>;
  className?: string;
  /** Oculta la columna en pantallas pequeñas. */
  hideOnMobile?: boolean;
}

export interface ResourceConfig {
  key: string;
  path: string;
  /** Sección para los breadcrumbs (por defecto "Archivo"). */
  section?: string;
  singular: string;
  plural: string;
  /** Género para textos ("el"/"la"). */
  article: "el" | "la";
  icon: LucideIcon;
  description: string;
  searchKeys: string[];
  columns: ColumnDef[];
  fields: FieldDef[];
  titleKey: string;
  subtitleKey?: string;
  /** Campos calculados que se añaden al leer (p. ej. nombre completo). */
  derive?: (row: Row) => Record<string, unknown>;
  seed: Row[];
}
