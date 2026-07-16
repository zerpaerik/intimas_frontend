"use client";

import * as React from "react";
import { CalendarDays, FileDown, FileSpreadsheet, Layers, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatPEN } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { SEDES } from "@/lib/auth/roles";
import { downloadCSV } from "@/lib/export/csv";
import { type PorServicioResponse } from "@/lib/api/reportes";

const KIND_COLOR: Record<string, string> = {
  Ecografía: "#e6007e", "Rayos X": "#0091d5", "Salud Mental": "#7c3aed",
  Otros: "#00b8a9", Laboratorio: "#f5a623", Paquete: "#9b2d69",
  Consulta: "#0091d5", Método: "#e6007e", Servicio: "#0091d5",
};
const colorOf = (k: string) => KIND_COLOR[k] ?? "#64748b";

function localDate(d: Date = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
const firstOfMonth = () => { const d = new Date(); return localDate(new Date(d.getFullYear(), d.getMonth(), 1)); };

export function ReportePorServicio() {
  const today = localDate();
  const [desde, setDesde] = React.useState(firstOfMonth);
  const [hasta, setHasta] = React.useState(today);
  const [sede, setSede] = React.useState("all");

  const sedeParam = sede !== "all" ? `&sedeId=${sede}` : "";
  const { data, loading, error, refetch } = useApiItem<PorServicioResponse>(
    `/reportes/por-servicio?desde=${desde}&hasta=${hasta}${sedeParam}`,
  );
  const isHoy = desde === today && hasta === today;
  const isMes = desde === firstOfMonth() && hasta === today;

  const maxCant = React.useMemo(
    () => Math.max(1, ...(data?.porServicio ?? []).map((s) => s.cantidad)),
    [data],
  );

  function exportarExcel() {
    if (!data) return;
    downloadCSV(
      `produccion-servicios_${desde}_a_${hasta}`,
      ["Servicio", "Tipo", "Cantidad", "Monto (S/)"],
      data.porServicio.map((s) => [s.nombre, s.kind, s.cantidad, s.monto.toFixed(2)]),
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Reportes <span className="px-1">›</span>
        <span className="text-foreground">Producción por servicio</span>
      </p>
      <PageHeader
        title="Producción por servicio"
        description="Cuántos servicios se hicieron en el período (cantidad y monto), por servicio y por tipo."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportarExcel} disabled={!data}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" onClick={() => window.open(`/reporte-pdf/por-servicio?desde=${desde}&hasta=${hasta}${sedeParam}`, "_blank")}>
              <FileDown className="h-4 w-4" /> PDF
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Sede</Label>
          <Select value={sede} onValueChange={setSede}>
            <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las sedes</SelectItem>
              {SEDES.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Desde</Label>
          <Input type="date" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} className="h-9 w-[9.5rem]" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Hasta</Label>
          <Input type="date" value={hasta} min={desde || undefined} max={today} onChange={(e) => setHasta(e.target.value)} className="h-9 w-[9.5rem]" />
        </div>
        <Button variant={isHoy ? "default" : "outline"} size="sm" className={cn("h-9", isHoy && "bg-brand text-white hover:bg-brand/90")} onClick={() => { setDesde(today); setHasta(today); }}>
          <CalendarDays className="h-4 w-4" /> Hoy
        </Button>
        <Button variant={isMes ? "default" : "outline"} size="sm" className={cn("h-9", isMes && "bg-brand text-white hover:bg-brand/90")} onClick={() => { setDesde(firstOfMonth()); setHasta(today); }}>
          Este mes
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border py-16 text-center text-sm text-muted-foreground">
          <TriangleAlert className="h-6 w-6 text-destructive" /> No se pudo cargar el reporte.
          <Button variant="outline" size="sm" onClick={refetch} className="mt-1">Reintentar</Button>
        </div>
      ) : loading || !data ? (
        <div className="space-y-4"><Skeleton className="h-24 w-full rounded-2xl" /><Skeleton className="h-80 w-full rounded-2xl" /></div>
      ) : (
        <>
          {/* KPIs + por tipo */}
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "color-mix(in srgb, #00b8a9 14%, transparent)", color: "#00b8a9" }}>
                <Layers className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{data.total.cantidad} servicio{data.total.cantidad === 1 ? "" : "s"}</p>
                <p className="font-heading text-2xl font-bold">{formatPEN(data.total.monto)}</p>
              </div>
            </div>
            {data.porTipo.slice(0, 3).map((t) => (
              <div key={t.kind} className="rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorOf(t.kind) }} />
                  <p className="text-xs text-muted-foreground">{t.kind}</p>
                </div>
                <p className="mt-1 font-heading text-xl font-bold tabular-nums">{t.cantidad}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{formatPEN(t.monto)}</p>
              </div>
            ))}
          </div>

          {/* Tabla por servicio (con barra de cantidad) */}
          <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b p-3">
              <p className="text-sm font-semibold">Detalle por servicio</p>
              <span className="text-sm text-muted-foreground">{data.porServicio.length} servicio{data.porServicio.length === 1 ? "" : "s"}</span>
            </div>
            {data.porServicio.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">No hay servicios en el rango seleccionado.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Servicio</TableHead>
                    <TableHead className="text-xs">Tipo</TableHead>
                    <TableHead className="text-xs">Cantidad</TableHead>
                    <TableHead className="text-right text-xs">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.porServicio.map((s, i) => {
                    const color = colorOf(s.kind);
                    return (
                      <TableRow key={`${s.nombre}-${i}`}>
                        <TableCell className="font-medium">{s.nombre}</TableCell>
                        <TableCell>
                          <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>{s.kind}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full" style={{ width: `${(s.cantidad / maxCant) * 100}%`, background: color }} />
                            </div>
                            <span className="tabular-nums font-medium">{s.cantidad}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{formatPEN(s.monto)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
