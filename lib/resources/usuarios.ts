import { Users } from "lucide-react";
import { ROLES } from "@/lib/auth/roles";
import type { ResourceConfig } from "./types";

const roleColorMap: Record<string, string> = Object.fromEntries(ROLES.map((r) => [r.name, r.color]));
const roleOptions = ROLES.map((r) => ({ value: String(r.id), label: r.name }));
const ESTADO_COLOR: Record<string, string> = { Activo: "#16a34a", Inactivo: "#94a3b8" };

export const usuarios: ResourceConfig = {
  key: "usuarios",
  path: "/administrativo/usuarios",
  section: "Administrativo",
  singular: "Usuario",
  plural: "Usuarios",
  article: "el",
  icon: Users,
  description: "Usuarios del sistema, con su rol y estado.",
  searchKeys: ["nombre", "email"],
  titleKey: "nombre",
  subtitleKey: "email",
  derive: (r) => ({
    role: (r.role as { nombre?: string } | undefined)?.nombre ?? "",
    estado: r.activo === false ? "Inactivo" : "Activo",
  }),
  columns: [
    { key: "nombre", header: "Usuario", type: "primary", subKey: "email" },
    { key: "role", header: "Rol", type: "badge", colorMap: roleColorMap },
    { key: "estado", header: "Estado", type: "badge", colorMap: ESTADO_COLOR },
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
    { name: "roleId", label: "Rol", type: "select", required: true, numeric: true, span: 2, options: roleOptions },
    { name: "colegiatura", label: "Colegiatura (CMP / COP…)", type: "uppercase", span: 2, help: "Solo profesionales de salud: se imprime en la historia que llene este usuario." },
    {
      name: "activo",
      label: "Usuario activo",
      type: "boolean",
      span: 2,
      help: "Si se desactiva, el usuario no podrá iniciar sesión (no se borra su información).",
    },
  ],
  seed: [],
};
