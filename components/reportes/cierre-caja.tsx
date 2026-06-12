"use client";

import * as React from "react";
import { Banknote, CalendarDays, Printer, Scale, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatPEN, formatDateLong } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { METODOS_PAGO } from "@/lib/api/atenciones";

interface CierreResponse {
  fecha: string;
  ingresos: { porMetodo: Record<string, number>; total: number; cantidad: number };
  gastos: { porMetodo: Record<string, number>; total: number; cantidad: number };
  neto: number;
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

export function CierreCaja() {
  const today = localDate();
  const [fecha, setFecha] = React.useState(today);
  const { data, loading, error, refetch } = useApiItem<CierreResponse>(`/reportes/cierre-caja?fecha=${fecha}`);

  const neto = Number(data?.neto ?? 0);

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Reportes <span className="px-1">›</span>
        <span className="text-foreground">Cierre de Caja</span>
      </p>
      <PageHeader
        title="Cierre de caja"
        description="Resumen de ingresos y egresos del día."
        actions={
          <Button variant="outline" onClick={() => toast.info("Exportación a PDF disponible en la versión final.")}>
            <Printer className="h-4 w-4" /><span className="hidden sm:inline">Imprimir</span>
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-3">
        <div className="space-y-1">
          <Label htmlFor="fecha" className="text-xs text-muted-foreground">Fecha</Label>
          <Input id="fecha" type="date" value={fecha} max={today} onChange={(e) => setFecha(e.target.value)} className="h-9 w-[10rem]" />
        </div>
        <Button variant={fecha === today ? "default" : "outline"} size="sm" className={cn("h-9", fecha === today && "bg-brand text-white hover:bg-brand/90")} onClick={() => setFecha(today)}>
          <CalendarDays className="h-4 w-4" />Hoy
        </Button>
        <span className="ml-auto text-sm capitalize text-muted-foreground">{formatDateLong(`${fecha}T12:00:00`)}</span>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border py-16 text-center text-sm text-muted-foreground">
          <TriangleAlert className="h-6 w-6 text-destructive" />
          No se pudo cargar el cierre.
          <Button variant="outline" size="sm" onClick={refetch} className="mt-1">Reintentar</Button>
        </div>
      ) : loading || !data ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-3">
          {/* Ingresos */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-success">
                <TrendingUp className="h-4 w-4" /> Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="font-heading text-3xl font-bold text-success">{formatPEN(Number(data.ingresos.total))}</p>
              <p className="mb-3 text-xs text-muted-foreground">{data.ingresos.cantidad} pago{data.ingresos.cantidad === 1 ? "" : "s"}</p>
              <ul className="space-y-2">
                {METODOS_PAGO.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: METODO_COLOR[m] }} />
                    <span className="text-muted-foreground">{m}</span>
                    <span className="ml-auto font-medium tabular-nums">{formatPEN(Number(data.ingresos.porMetodo[m] ?? 0))}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Gastos */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <TrendingDown className="h-4 w-4" /> Gastos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="font-heading text-3xl font-bold text-destructive">{formatPEN(Number(data.gastos.total))}</p>
              <p className="mb-3 text-xs text-muted-foreground">{data.gastos.cantidad} gasto{data.gastos.cantidad === 1 ? "" : "s"}</p>
              <ul className="space-y-2">
                {METODOS_PAGO.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: METODO_COLOR[m] }} />
                    <span className="text-muted-foreground">{m}</span>
                    <span className="ml-auto font-medium tabular-nums">{formatPEN(Number(data.gastos.porMetodo[m] ?? 0))}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Neto */}
          <Card className={cn("border-2", neto >= 0 ? "border-success/30" : "border-destructive/30")}>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2"><Scale className="h-4 w-4 text-brand" /> Neto del día</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className={cn("font-heading text-4xl font-bold", neto >= 0 ? "text-success" : "text-destructive")}>{formatPEN(neto)}</p>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Ingresos</span><span className="font-medium tabular-nums text-success">+{formatPEN(Number(data.ingresos.total))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Gastos</span><span className="font-medium tabular-nums text-destructive">−{formatPEN(Number(data.gastos.total))}</span></div>
                <div className="flex justify-between border-t pt-1.5"><span className="font-semibold">Neto</span><span className={cn("font-bold tabular-nums", neto >= 0 ? "text-success" : "text-destructive")}>{formatPEN(neto)}</span></div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <Banknote className="h-3.5 w-3.5" /> Caja en efectivo: {formatPEN(Number(data.ingresos.porMetodo["Efectivo"] ?? 0) - Number(data.gastos.porMetodo["Efectivo"] ?? 0))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
