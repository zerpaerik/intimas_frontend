"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, CalendarDays, MoreHorizontal, Pencil, Plus, Printer, Receipt, Search, TriangleAlert } from "lucide-react";
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
import { formatPEN } from "@/lib/format";
import { useApiList } from "@/lib/api/hooks";
import { useSedeFiltro } from "@/lib/auth/store";
import { type Gasto } from "@/lib/api/gastos";
import { AnularDialog } from "@/components/atenciones/anular-dialog";

const fechaCorta = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short" });

function localDate(d: Date = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function GastosList() {
  const router = useRouter();
  const sedeId = useSedeFiltro();
  const { data: gastos, loading, error, refetch } = useApiList<Gasto>(`/gastos${sedeId ? `?sedeId=${sedeId}` : ""}`);

  const today = localDate();
  const [desde, setDesde] = React.useState(today);
  const [hasta, setHasta] = React.useState(today);
  const [query, setQuery] = React.useState("");
  const [anularTarget, setAnularTarget] = React.useState<Gasto | null>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...gastos]
      .filter((g) => {
        const f = localDate(new Date(g.fecha));
        if (desde && f < desde) return false;
        if (hasta && f > hasta) return false;
        return true;
      })
      .filter((g) =>
        !q ? true : `${g.descripcion} ${g.categoria ?? ""} ${g.proveedor ?? ""}`.toLowerCase().includes(q),
      )
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
  }, [gastos, desde, hasta, query]);

  const isHoy = desde === today && hasta === today;
  const isTodas = !desde && !hasta;
  const total = rows.filter((g) => !g.anulada).reduce((s, g) => s + Number(g.monto), 0);

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Movimientos <span className="px-1">›</span>
        <span className="text-foreground">Gastos</span>
      </p>
      <PageHeader
        title="Gastos"
        description="Egresos del consultorio para el control financiero."
        actions={
          <Button asChild className="bg-brand-gradient text-white">
            <Link href="/movimientos/gastos/nuevo">
              <Plus className="h-4 w-4" />
              Nuevo gasto
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border bg-card">
        <div className="flex flex-wrap items-end gap-3 border-b p-3">
          <div className="space-y-1">
            <Label htmlFor="desde" className="text-xs text-muted-foreground">Desde</Label>
            <Input id="desde" type="date" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} className="h-9 w-[9.5rem]" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hasta" className="text-xs text-muted-foreground">Hasta</Label>
            <Input id="hasta" type="date" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} className="h-9 w-[9.5rem]" />
          </div>
          <Button variant={isHoy ? "default" : "outline"} size="sm" className={cn("h-9", isHoy && "bg-brand text-white hover:bg-brand/90")} onClick={() => { setDesde(today); setHasta(today); }}>
            <CalendarDays className="h-4 w-4" />
            Hoy
          </Button>
          <Button variant={isTodas ? "default" : "outline"} size="sm" className={cn("h-9", isTodas && "bg-brand text-white hover:bg-brand/90")} onClick={() => { setDesde(""); setHasta(""); }}>
            Todos
          </Button>

          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar descripción, categoría…" className="h-9 pl-9" />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total del rango</p>
            <p className="font-heading text-lg font-bold text-destructive">{formatPEN(total)}</p>
          </div>
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
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <Receipt className="h-6 w-6 text-muted-foreground" />
            {isHoy ? "No hay gastos registrados hoy." : "No hay gastos en el rango seleccionado."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Fecha</TableHead>
                <TableHead className="text-xs">Descripción</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Categoría</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Método</TableHead>
                <TableHead className="text-xs text-right">Monto</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((g) => {
                const dt = new Date(g.fecha);
                return (
                  <TableRow key={g.id} className={cn(g.anulada && "opacity-55")}>
                    <TableCell className="font-medium">{fechaCorta.format(dt)}</TableCell>
                    <TableCell>
                      <div className={cn("font-medium", g.anulada && "line-through")}>{g.descripcion}</div>
                      {g.proveedor && <div className="text-xs text-muted-foreground">{g.proveedor}</div>}
                      {g.nota && <div className="text-xs italic text-muted-foreground">{g.nota}</div>}
                      {g.anulada && g.motivoAnulacion && (
                        <div className="text-xs text-destructive">Anulado · {g.motivoAnulacion}</div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {g.categoria ? <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{g.categoria}</span> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{g.metodo}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {g.anulada ? <span className="text-muted-foreground line-through">{formatPEN(Number(g.monto))}</span> : formatPEN(Number(g.monto))}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/comprobante-gasto/${g.id}`, "_blank")}>
                            <Printer className="h-4 w-4" />Comprobante
                          </DropdownMenuItem>
                          {!g.anulada && (
                            <>
                              <DropdownMenuItem onClick={() => router.push(`/movimientos/gastos/${g.id}/editar`)}>
                                <Pencil className="h-4 w-4" />Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => setAnularTarget(g)}>
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

      {anularTarget && (
        <AnularDialog
          open={!!anularTarget}
          onOpenChange={(o) => !o && setAnularTarget(null)}
          path={`/gastos/${anularTarget.id}/anular`}
          titulo="Anular gasto"
          descripcion={`Se anulará el gasto “${anularTarget.descripcion}”. No se elimina: queda visible como anulado y deja de restar en caja.`}
          onDone={() => { setAnularTarget(null); refetch(); }}
        />
      )}
    </div>
  );
}
