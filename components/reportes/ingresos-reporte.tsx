"use client";

import * as React from "react";
import { CalendarDays, FileDown, TrendingUp, TriangleAlert, Wallet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatPEN, formatDate } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { METODOS_PAGO } from "@/lib/api/atenciones";

interface PagoRow {
  id: number;
  fecha: string;
  metodo: string;
  tipo: string;
  monto: number;
  sede?: { nombre: string } | null;
  usuario?: { nombre: string } | null;
  atencion?: { id: number; paciente?: { nombres: string; apellidos: string } } | null;
}
interface IngresosResponse {
  pagos: PagoRow[];
  porMetodo: Record<string, number>;
  total: number;
  cantidad: number;
}

const METODO_COLOR: Record<string, string> = {
  Efectivo: "#16a34a",
  Yape: "#e6007e",
  Tarjeta: "#0091d5",
  Depósito: "#7c3aed",
};

function localDate(d: Date = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function IngresosReporte() {
  const today = localDate();
  const [desde, setDesde] = React.useState(today);
  const [hasta, setHasta] = React.useState(today);
  const { data, loading, error, refetch } = useApiItem<IngresosResponse>(
    `/reportes/ingresos?desde=${desde}&hasta=${hasta}`,
  );
  const isHoy = desde === today && hasta === today;

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Reportes <span className="px-1">›</span>
        <span className="text-foreground">Reporte de Ingresos</span>
      </p>
      <PageHeader
        title="Reporte de ingresos"
        description="Ingresos por método de pago en un rango de fechas."
        actions={
          <Button variant="outline" onClick={() => window.open(`/reporte-pdf/ingresos?desde=${desde}&hasta=${hasta}`, "_blank")}>
            <FileDown className="h-4 w-4" /> PDF
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-3">
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
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 sm:col-span-2 lg:col-span-1">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "color-mix(in srgb, #00b8a9 14%, transparent)", color: "#00b8a9" }}>
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Total ingresos</p>
                <p className="font-heading text-2xl font-bold">{formatPEN(Number(data.total))}</p>
              </div>
            </div>
            {METODOS_PAGO.map((m) => (
              <div key={m} className="rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: METODO_COLOR[m] }} />
                  <p className="text-xs text-muted-foreground">{m}</p>
                </div>
                <p className="mt-1 font-heading text-xl font-bold tabular-nums">{formatPEN(Number(data.porMetodo[m] ?? 0))}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b p-3">
              <p className="flex items-center gap-2 text-sm font-semibold"><TrendingUp className="h-4 w-4 text-brand" /> Detalle de pagos</p>
              <span className="text-sm text-muted-foreground">{data.cantidad} pago{data.cantidad === 1 ? "" : "s"}</span>
            </div>
            {data.pagos.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">No hay ingresos en el rango seleccionado.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Fecha</TableHead>
                    <TableHead className="text-xs">Paciente</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Tipo</TableHead>
                    <TableHead className="text-xs">Método</TableHead>
                    <TableHead className="text-xs text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pagos.map((p) => {
                    const nombre = p.atencion?.paciente
                      ? `${p.atencion.paciente.nombres} ${p.atencion.paciente.apellidos}`.trim()
                      : "—";
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-muted-foreground">{formatDate(p.fecha)}</TableCell>
                        <TableCell className="font-medium">{nombre}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{p.tipo === "ABONO_INICIAL" ? "Abono inicial" : "Cobro"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ background: METODO_COLOR[p.metodo] ?? "#64748b" }} />
                            {p.metodo}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{formatPEN(Number(p.monto))}</TableCell>
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
