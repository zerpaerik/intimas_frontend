"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatPEN, initials } from "@/lib/format";
import { useAtenciones, isToday, type Atencion, type AtnEstado } from "@/lib/data/atenciones-store";

const ESTADO_COLOR: Record<AtnEstado, string> = {
  Pagado: "#16a34a",
  Parcial: "#f5a623",
  Pendiente: "#ef4444",
};

const fechaCorta = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short" });
const horaCorta = new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" });

type Filtro = "hoy" | "anteriores" | "todas";

export function AtencionesList() {
  const router = useRouter();
  const atenciones = useAtenciones((s) => s.atenciones);
  const hydrated = useAtenciones((s) => s.hydrated);
  const removeAtencion = useAtenciones((s) => s.removeAtencion);

  const [filtro, setFiltro] = React.useState<Filtro>("hoy");
  const [query, setQuery] = React.useState("");
  const [target, setTarget] = React.useState<Atencion | null>(null);

  const counts = React.useMemo(() => {
    const hoy = atenciones.filter((a) => isToday(a.fecha)).length;
    return { hoy, anteriores: atenciones.length - hoy, todas: atenciones.length };
  }, [atenciones]);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...atenciones]
      .filter((a) => (filtro === "hoy" ? isToday(a.fecha) : filtro === "anteriores" ? !isToday(a.fecha) : true))
      .filter((a) =>
        !q
          ? true
          : `${a.paciente.nombres} ${a.paciente.apellidos}`.toLowerCase().includes(q) ||
            a.paciente.numDoc.toLowerCase().includes(q),
      )
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
  }, [atenciones, filtro, query]);

  const TABS: { key: Filtro; label: string; n: number }[] = [
    { key: "hoy", label: "Hoy", n: counts.hoy },
    { key: "anteriores", label: "Anteriores", n: counts.anteriores },
    { key: "todas", label: "Todas", n: counts.todas },
  ];

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Movimientos <span className="px-1">›</span>
        <span className="text-foreground">Atenciones</span>
      </p>
      <PageHeader
        title="Atenciones"
        description="Registro de atenciones del día y anteriores."
        actions={
          <Button asChild className="bg-brand-gradient text-white">
            <Link href="/movimientos/atenciones/nueva">
              <Plus className="h-4 w-4" />
              Nueva atención
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-3">
          <div className="flex rounded-lg border p-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setFiltro(t.key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  filtro === t.key ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                <span className={cn("ml-1.5 text-xs", filtro === t.key ? "text-white/80" : "text-muted-foreground")}>
                  {t.n}
                </span>
              </button>
            ))}
          </div>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar paciente…" className="pl-9" />
          </div>
        </div>

        {!hydrated ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {filtro === "hoy" ? "No hay atenciones registradas hoy." : "No se encontraron atenciones."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Fecha</TableHead>
                <TableHead className="text-xs">Paciente</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Detalle</TableHead>
                <TableHead className="text-xs">Total</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => {
                const dt = new Date(a.fecha);
                const nombre = `${a.paciente.nombres} ${a.paciente.apellidos}`;
                const color = ESTADO_COLOR[a.estado];
                return (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => router.push(`/movimientos/atenciones/${a.id}`)}>
                    <TableCell>
                      <div className="font-medium">{fechaCorta.format(dt)}</div>
                      <div className="text-xs text-muted-foreground">{horaCorta.format(dt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft text-xs font-bold text-brand">
                          {initials(nombre)}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{nombre}</div>
                          <div className="text-xs text-muted-foreground">{a.paciente.tipoDoc} {a.paciente.numDoc}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {a.items.slice(0, 2).map((it, i) => (
                          <span key={i} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{it.nombre}</span>
                        ))}
                        {a.items.length > 2 && <span className="text-xs text-muted-foreground">+{a.items.length - 2}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">{formatPEN(a.total)}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                        {a.estado}
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/movimientos/atenciones/${a.id}`)}>
                            <Eye className="h-4 w-4" />Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/movimientos/atenciones/${a.id}/editar`)}>
                            <Pencil className="h-4 w-4" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setTarget(a)}>
                            <Trash2 className="h-4 w-4" />Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar atención?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la atención de{" "}
              <strong className="text-foreground">{target ? `${target.paciente.nombres} ${target.paciente.apellidos}` : ""}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (target) {
                  removeAtencion(target.id);
                  toast.success("Atención eliminada");
                }
                setTarget(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
