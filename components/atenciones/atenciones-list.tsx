"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, CalendarDays, Eye, HandCoins, MoreHorizontal, Pencil, Plus, Search, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatPEN, initials } from "@/lib/format";
import { useApiList } from "@/lib/api/hooks";
import { isToday, type Atencion, type AtnEstado } from "@/lib/api/atenciones";
import { useAuth } from "@/lib/auth/store";
import { CobroDialog } from "./cobro-dialog";
import { AnularDialog } from "./anular-dialog";

const ESTADO_COLOR: Record<AtnEstado, string> = {
  Pagado: "#16a34a",
  Parcial: "#f5a623",
  Pendiente: "#ef4444",
};

const fechaCorta = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short" });
const horaCorta = new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" });

/** Fecha local en formato YYYY-MM-DD (sin desfase de zona horaria). */
function localDate(d: Date = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function AtencionesList() {
  const router = useRouter();
  const roleId = useAuth((s) => s.session?.roleId ?? 1);
  const { data: atenciones, loading, error, refetch } = useApiList<Atencion>("/atenciones");

  const today = localDate();
  const [desde, setDesde] = React.useState(today);
  const [hasta, setHasta] = React.useState(today);
  const [query, setQuery] = React.useState("");
  const [cobroTarget, setCobroTarget] = React.useState<Atencion | null>(null);
  const [anularTarget, setAnularTarget] = React.useState<Atencion | null>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...atenciones]
      .filter((a) => {
        const f = localDate(new Date(a.fecha));
        if (desde && f < desde) return false;
        if (hasta && f > hasta) return false;
        return true;
      })
      .filter((a) =>
        !q
          ? true
          : `${a.paciente?.nombres} ${a.paciente?.apellidos}`.toLowerCase().includes(q) ||
            String(a.paciente?.numDoc ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
  }, [atenciones, desde, hasta, query]);

  const isHoy = desde === today && hasta === today;
  const isTodas = !desde && !hasta;

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Movimientos <span className="px-1">›</span>
        <span className="text-foreground">Atenciones</span>
      </p>
      <PageHeader
        title="Atenciones"
        description="Registro de atenciones por fecha."
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
        {/* Filtros por fecha */}
        <div className="flex flex-wrap items-end gap-3 border-b p-3">
          <div className="space-y-1">
            <Label htmlFor="desde" className="text-xs text-muted-foreground">Desde</Label>
            <Input id="desde" type="date" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} className="h-9 w-[9.5rem]" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hasta" className="text-xs text-muted-foreground">Hasta</Label>
            <Input id="hasta" type="date" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} className="h-9 w-[9.5rem]" />
          </div>
          <Button
            variant={isHoy ? "default" : "outline"}
            size="sm"
            className={cn("h-9", isHoy && "bg-brand text-white hover:bg-brand/90")}
            onClick={() => { setDesde(today); setHasta(today); }}
          >
            <CalendarDays className="h-4 w-4" />
            Hoy
          </Button>
          <Button
            variant={isTodas ? "default" : "outline"}
            size="sm"
            className={cn("h-9", isTodas && "bg-brand text-white hover:bg-brand/90")}
            onClick={() => { setDesde(""); setHasta(""); }}
          >
            Todas
          </Button>

          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar paciente…" className="h-9 pl-9" />
          </div>
          <span className="text-sm text-muted-foreground">
            {rows.length} registro{rows.length === 1 ? "" : "s"}
          </span>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <TriangleAlert className="h-6 w-6 text-destructive" />
            No se pudo cargar la información.
            <span className="text-xs">{error}</span>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-1">Reintentar</Button>
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {isHoy ? "No hay atenciones registradas hoy." : "No hay atenciones en el rango seleccionado."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Fecha</TableHead>
                <TableHead className="text-xs">Paciente</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Detalle</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs text-right hidden sm:table-cell">Saldo</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => {
                const dt = new Date(a.fecha);
                const nombre = `${a.paciente?.nombres ?? ""} ${a.paciente?.apellidos ?? ""}`.trim();
                const anulada = !!a.anulada;
                const saldo = Number(a.saldo);
                const color = anulada ? "#64748b" : (ESTADO_COLOR[a.estado] ?? "#64748b");
                const puedeEditar = !anulada && (isToday(a.fecha) || roleId === 1);
                return (
                  <TableRow key={a.id} className={cn("cursor-pointer", anulada && "opacity-55")} onClick={() => router.push(`/movimientos/atenciones/${a.id}`)}>
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
                          <div className={cn("truncate font-medium", anulada && "line-through")}>{nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {a.paciente?.tipoDoc} {a.paciente?.numDoc}
                          </div>
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
                    <TableCell className="text-right font-medium tabular-nums">{formatPEN(Number(a.total))}</TableCell>
                    <TableCell className="text-right tabular-nums hidden sm:table-cell">
                      {!anulada && saldo > 0
                        ? <span className="font-medium text-destructive">{formatPEN(saldo)}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                        {anulada ? "Anulada" : a.estado}
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
                          {!anulada && saldo > 0 && (
                            <DropdownMenuItem onClick={() => setCobroTarget(a)}>
                              <HandCoins className="h-4 w-4" />Abonar
                            </DropdownMenuItem>
                          )}
                          {puedeEditar && (
                            <DropdownMenuItem onClick={() => router.push(`/movimientos/atenciones/${a.id}/editar`)}>
                              <Pencil className="h-4 w-4" />Editar
                            </DropdownMenuItem>
                          )}
                          {!anulada && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => setAnularTarget(a)}>
                                <Ban className="h-4 w-4" />Anular
                              </DropdownMenuItem>
                            </>
                          )}
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

      {cobroTarget && (
        <CobroDialog
          open={!!cobroTarget}
          onOpenChange={(o) => !o && setCobroTarget(null)}
          atencionId={cobroTarget.id}
          saldo={Number(cobroTarget.saldo)}
          paciente={`${cobroTarget.paciente?.nombres ?? ""} ${cobroTarget.paciente?.apellidos ?? ""}`.trim()}
          onDone={() => { setCobroTarget(null); refetch(); }}
        />
      )}
      {anularTarget && (
        <AnularDialog
          open={!!anularTarget}
          onOpenChange={(o) => !o && setAnularTarget(null)}
          path={`/atenciones/${anularTarget.id}/anular`}
          titulo="Anular atención"
          descripcion={`Se anulará la atención de ${anularTarget.paciente?.nombres ?? ""} ${anularTarget.paciente?.apellidos ?? ""}. No se elimina: queda visible como anulada y deja de sumar en caja.`}
          onDone={() => { setAnularTarget(null); refetch(); }}
        />
      )}
    </div>
  );
}
