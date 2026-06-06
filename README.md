# Intimas — Consultorios Médicos · Frontend (mockup)

Propuesta de rediseño moderno del sistema clínico **Intimas — Para Él y Ella**.
Mockup semi-funcional construido en **Next.js** con datos simulados (sin backend),
pensado para evolucionar a producción conectando una API real.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** + sistema de diseño de marca (fucsia + azul)
- **shadcn/ui** (Radix) · **lucide-react**
- **TanStack Table** · **React Hook Form + Zod** · **Recharts**
- **Zustand** (sesión y datos en memoria, persistidos en `localStorage`)
- **next-themes** (claro/oscuro) · **sonner** (toasts)

## Cómo correrlo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm run start    # servidor de producción
```

## Acceso (demo)

Cualquier correo y contraseña funcionan. En la pantalla de login hay
**accesos rápidos** para entrar como cada rol del sistema:

| Rol | Acceso |
|-----|--------|
| Administrador | acceso total |
| Admin. Financiero | caja, cobros, comisiones |
| Personal Clínico | atenciones, consultas, historias |
| Técnico de Laboratorio | resultados y análisis |
| Visitador Médico | comisiones y visitas |
| Gerente Sede C | reportes y finanzas de la sede |

El menú lateral y el dashboard se adaptan automáticamente al rol.

## Qué está implementado

- **Login** a dos columnas con panel de marca.
- **Dashboard** interactivo por rol (KPIs, gráficos, actividad, pendientes).
- **Archivos** (maestros) con CRUD completo: Pacientes, Profesionales,
  Servicios, Análisis, Laboratorios, Paquetes, Personal, Centros, Productos,
  Material — lista, alta, edición, detalle, validación y borrado.
- **Atenciones** (Movimientos) — listado filtrable (hoy / anteriores / todas),
  registro con búsqueda de paciente, alta rápida si no existe, panel de
  historial del paciente al lado, ítems con monto/abono/tipo de pago, ver y editar.
- Los demás módulos (Comisiones, Resultados, Reportes, etc.) aparecen como
  vistas previas "En construcción" para mostrar la navegación completa por rol.

## Arquitectura

- `lib/resources/` — configuración por maestro (columnas, campos, semillas).
  Las páginas de lista/alta/detalle/edición son **genéricas** y se alimentan de
  esta configuración (`app/(app)/archivos/[resource]/…`).
- `lib/data/resource-store.ts` — CRUD en memoria (cambiar por una API real aquí).
- `lib/auth/` — roles, usuarios demo y sesión.
- `components/` — UI (shadcn), layout (sidebar/topbar), brand, dashboard, forms.

## Despliegue (Railway)

El proyecto incluye `railway.json` y `.nvmrc`. Railway detecta Next.js con
Nixpacks: build `npm run build`, start `npm run start` (respeta `$PORT`).
