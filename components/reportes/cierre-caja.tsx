"use client";

import * as React from "react";
import { CalendarDays, Eye, Lock, LockOpen, Printer, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatPEN } from "@/lib/format";
import { useApiList } from "@/lib/api/hooks";
import { useSedeFiltro } from "@/lib/auth/store";
import { type CajaSesion } from "@/lib/api/caja";

const n = (x: unknown) => Number(x ?? 0);
function localDate(d: Date = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
function fechaHora(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function CierreCaja() {
  const [estado, setEstado] = React.useState<"Todas" | "Abierta" | "Cerrada">("Todas");
  const [desde, setDesde] = React.useState("");
  const [hasta, setHasta] = React.useState("");

  const sedeId = useSedeFiltro();
  const qs = new URLSearchParams();
  if (estado !== "Todas") qs.set("estado", estado);
  if (desde) qs.set("desde", desde);
  if (hasta) qs.set("hasta", hasta);
  if (sedeId) qs.set("sedeId", String(sedeId));
  const { data: cajas, loading, error, refetch } = useApiList<CajaSesion>(`/caja?${qs.toString()}`);

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Reportes <span className="px-1">›</span>
        <span className="text-foreground">Cierre de Caja</span>
      </p>
      <PageHeader title="Cierres de caja" description="Sesiones de caja: apertura, arqueo y cierre. Cada reapertura es una caja nueva." />

      <div className="rounded-2xl border bg-card">
        <div className="flex flex-wrap items-end gap-3 border-b p-3">
          {(["Todas", "Abierta", "Cerrada"] as const).map((e) => (
            <Button key={e} size="sm" variant={estado === e ? "default" : "outline"} className={cn("h-9", estado === e && "bg-brand text-white hover:bg-brand/90")} onClick={() => setEstado(e)}>
              {e === "Abierta" ? "Abiertas" : e === "Cerrada" ? "Cerradas" : "Todas"}
            </Button>
          ))}
          <div className="mx-1 h-9 w-px bg-border" />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Desde</Label>
            <Input type="date" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} className="h-9 w-[9.5rem]" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hasta</Label>
            <Input type="date" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} className="h-9 w-[9.5rem]" />
          </div>
          <Button variant="outline" size="sm" className="h-9" onClick={() => { setDesde(localDate()); setHasta(localDate()); }}>
            <CalendarDays className="h-4 w-4" /> Hoy
          </Button>
          <span className="ml-auto text-sm text-muted-foreground">{cajas.length} cierre{cajas.length === 1 ? "" : "s"}</span>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <TriangleAlert className="h-6 w-6 text-destructive" /> No se pudieron cargar los cierres.
            <Button variant="outline" size="sm" onClick={refetch} className="mt-1">Reintentar</Button>
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
        ) : cajas.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No hay cierres de caja en este filtro.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Apertura</TableHead>
                <TableHead className="text-xs">Cierre</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Cajero</TableHead>
                <TableHead className="text-xs text-right">Ingresos</TableHead>
                <TableHead className="text-xs text-right hidden sm:table-cell">Gastos</TableHead>
                <TableHead className="text-xs text-right">Diferencia</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-right text-xs">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cajas.map((c) => {
                const abierta = c.estado === "Abierta";
                const dif = n(c.totalDiferencia);
                return (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => window.open(`/comprobante-caja/${c.id}`, "_blank")}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{fechaHora(c.fechaApertura)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{abierta ? "—" : fechaHora(c.fechaCierre)}</TableCell>
                    <TableCell className="hidden md:table-cell">{c.usuario?.nombre ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{abierta ? <span className="text-muted-foreground">en curso</span> : formatPEN(n(c.totalIngresos))}</TableCell>
                    <TableCell className="text-right tabular-nums hidden sm:table-cell">{abierta ? "—" : formatPEN(n(c.totalGastos))}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {abierta ? "—" : (
                        <span className={cn(Math.abs(dif) < 0.001 ? "text-success" : dif > 0 ? "text-amber-600" : "text-destructive")}>
                          {dif > 0 ? "+" : ""}{formatPEN(dif)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", abierta ? "bg-brand/10 text-brand" : "bg-emerald-50 text-emerald-700")}>
                        {abierta ? <LockOpen className="h-3 w-3" /> : <Lock className="h-3 w-3" />}{c.estado}
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(ev) => ev.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => window.open(`/comprobante-caja/${c.id}`, "_blank")}>
                        {abierta ? <Eye className="h-4 w-4" /> : <Printer className="h-4 w-4" />}
                        {abierta ? "Ver" : "Imprimir"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
