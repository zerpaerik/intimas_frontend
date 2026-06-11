import { Users } from "lucide-react";
import { ROLES, SEDES } from "@/lib/auth/roles";
import type { ResourceConfig } from "./types";

const roleColorMap: Record<string, string> = Object.fromEntries(ROLES.map((r) => [r.name, r.color]));
const roleOptions = ROLES.map((r) => ({ value: String(r.id), label: r.name }));
const sedeOptions = SEDES.map((s) => ({ value: String(s.id), label: s.name }));

export const usuarios: ResourceConfig = {
  key: "usuarios",
  path: "/administrativo/usuarios",
  section: "Administrativo",
  singular: "Usuario",
  plural: "Usuarios",
  article: "el",
  icon: Users,
  description: "Usuarios del sistema, con su rol y sede.",
  searchKeys: ["nombre", "email"],
  titleKey: "nombre",
  subtitleKey: "email",
  derive: (r) => ({
    role: (r.role as { nombre?: string } | undefined)?.nombre ?? "",
    sede: (r.sede as { nombre?: string } | undefined)?.nombre ?? "",
  }),
  columns: [
    { key: "nombre", header: "Usuario", type: "primary", subKey: "email" },
    { key: "role", header: "Rol", type: "badge", colorMap: roleColorMap },
    { key: "sede", header: "Sede", hideOnMobile: true },
    { key: "title", header: "Cargo", hideOnMobile: true },
  ],
  fields: [
    { name: "nombre", label: "Nombre completo", type: "text", required: true, span: 1 },
    { name: "email", label: "Correo electrónico", type: "email", required: true, span: 1 },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      span: 2,
      hideOnEdit: true,
      requiredOnCreate: true,
      help: "Mínimo 4 caracteres. Para cambiarla luego, edita desde aquí.",
    },
    { name: "roleId", label: "Rol", type: "select", required: true, numeric: true, span: 1, options: roleOptions },
    { name: "sedeId", label: "Sede", type: "select", numeric: true, span: 1, options: sedeOptions },
    { name: "title", label: "Cargo", type: "text", span: 2 },
  ],
  seed: [],
};
