"use client";

import * as React from "react";
import { Building2, CalendarDays, FileDown, FileSpreadsheet, Layers, TriangleAlert } from "lucide-react";
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
import { formatPEN, formatDate } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { SEDES } from "@/lib/auth/roles";
import { downloadCSV } from "@/lib/export/csv";

interface DetalleRow {
  atencionId: number;
  fecha: string;
  paciente: string;
  numDoc?: string | null;
  sedeId?: number | null;
  sede?: string | null;
  tipoServicio: string;
  concepto: string;
  monto: number;
  metodos: string[];
  estado: string;
}
interface DetalleResponse {
  rows: DetalleRow[];
  porTipo: Record<string, number>;
  total: number;
  cantidad: number;
}

const KIND_COLOR: Record<string, string> = {
  Ecografía: "#e6007e",
  "Rayos X": "#0091d5",
  "Salud Mental": "#7c3aed",
  Otros: "#00b8a9",
  Laboratorio: "#f5a623",
  Paquete: "#9b2d69",
  Consulta: "#0091d5",
  Método: "#e6007e",
  Servicio: "#0091d5",
};

function localDate(d: Date = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function ReporteDetallado() {
  const today = localDate();
  const [desde, setDesde] = React.useState(today);
  const [hasta, setHasta] = React.useState(today);
  const [sede, setSede] = React.useState("all");

  const sedeParam = sede !== "all" ? `&sedeId=${sede}` : "";
  const { data, loading, error, refetch } = useApiItem<DetalleResponse>(
    `/reportes/detallado?desde=${desde}&hasta=${hasta}${sedeParam}`,
  );
  const isHoy = desde === today && hasta === today;

  const tipos = React.useMemo(
    () => Object.entries(data?.porTipo ?? {}).map(([k, v]) => ({ k, v: Number(v) })).sort((a, b) => b.v - a.v),
    [data],
  );

  function exportarExcel() {
    if (!data) return;
    downloadCSV(
      `detallado_${desde}_a_${hasta}`,
      ["Fecha", "Paciente", "Documento", "Tipo de servicio", "Concepto", "Método", "Sede", "Monto (S/)"],
      data.rows.map((r) => [formatDate(r.fecha), r.paciente, r.numDoc ?? "", r.tipoServicio, r.concepto, r.metodos.join(" + "), r.sede ?? "", Number(r.monto).toFixed(2)]),
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Reportes <span className="px-1">›</span>
        <span className="text-foreground">Detallado por Sede</span>
      </p>
      <PageHeader
        title="Detallado por sede"
        description="Servicios prestados por tipo, con paciente, método de pago y sede."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportarExcel} disabled={!data}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" onClick={() => window.open(`/reporte-pdf/detallado?desde=${desde}&hasta=${hasta}${sede !== "all" ? `&sedeId=${sede}` : ""}`, "_blank")}>
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
          <Label htmlFor="desde" className="text-xs text-muted-foreground">Desde</Label>
          <Input id="desde" type="date" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} className="h-9 w-[9.5rem]" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hasta" className="text-xs text-muted-foreground">Hasta</Label>
          <Input id="hasta" type="date" value={hasta} min={desde || undefined} max={today} onChange={(e) => setHasta(e.target.value)} className="h-9 w-[9.5rem]" />
        </div>
        <Button variant={isHoy ? "default" : "outline"} size="sm" className={cn("h-9", isHoy && "bg-brand text-white hover:bg-brand/90")} onClick={() => { setDesde(today); setHasta(today); }}>
          <CalendarDays className="h-4 w-4" />Hoy
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border py-16 text-center text-sm text-muted-foreground">
          <TriangleAlert className="h-6 w-6 text-destructive" />
          No se pudo cargar el reporte.
          <Button variant="outline" size="sm" onClick={refetch} className="mt-1">Reintentar</Button>
        </div>
      ) : loading || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Subtotales por tipo de servicio */}
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "color-mix(in srgb, #00b8a9 14%, transparent)", color: "#00b8a9" }}>
                <Layers className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Total · {data.cantidad} ítem{data.cantidad === 1 ? "" : "s"}</p>
                <p className="font-heading text-2xl font-bold">{formatPEN(Number(data.total))}</p>
              </div>
            </div>
            {tipos.map(({ k, v }) => {
              const color = KIND_COLOR[k] ?? "#64748b";
              return (
                <div key={k} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                    <p className="text-xs text-muted-foreground">{k}</p>
                  </div>
                  <p className="mt-1 font-heading text-xl font-bold tabular-nums">{formatPEN(v)}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b p-3">
              <p className="flex items-center gap-2 text-sm font-semibold"><Building2 className="h-4 w-4 text-brand" /> Detalle</p>
              <span className="text-sm text-muted-foreground">{data.rows.length} registro{data.rows.length === 1 ? "" : "s"}</span>
            </div>
            {data.rows.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">No hay servicios en el rango seleccionado.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Fecha</TableHead>
                    <TableHead className="text-xs">Paciente</TableHead>
                    <TableHead className="text-xs">Tipo de servicio</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Concepto</TableHead>
                    <TableHead className="text-xs">Tipo de pago</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Sede</TableHead>
                    <TableHead className="text-xs text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((r, i) => {
                    const color = KIND_COLOR[r.tipoServicio] ?? "#64748b";
                    return (
                      <TableRow key={`${r.atencionId}-${i}`}>
                        <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(r.fecha)}</TableCell>
                        <TableCell className="font-medium">{r.paciente}</TableCell>
                        <TableCell>
                          <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                            {r.tipoServicio}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{r.concepto}</TableCell>
                        <TableCell className="text-muted-foreground">{r.metodos.length ? r.metodos.join(" + ") : "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{r.sede ?? "—"}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{formatPEN(Number(r.monto))}</TableCell>
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
