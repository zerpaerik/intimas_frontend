"use client";

import * as React from "react";
import { CalendarDays, FileDown, FileSpreadsheet, Stethoscope, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { SEDES } from "@/lib/auth/roles";
import { downloadCSV } from "@/lib/export/csv";
import { type PorProfesionalResponse, type ProfProduccion } from "@/lib/api/reportes";

function localDate(d: Date = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
const firstOfMonth = () => { const d = new Date(); return localDate(new Date(d.getFullYear(), d.getMonth(), 1)); };

function Ranking({ titulo, rows, color, unidad }: { titulo: string; rows: ProfProduccion[]; color: string; unidad: string }) {
  const max = Math.max(1, ...rows.map((r) => r.cantidad));
  const total = rows.reduce((s, r) => s + r.cantidad, 0);
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b p-3">
        <p className="flex items-center gap-2 text-sm font-semibold"><Stethoscope className="h-4 w-4" style={{ color }} /> {titulo}</p>
        <span className="text-sm text-muted-foreground">{total} en total</span>
      </div>
      {rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Sin datos en el rango.</div>
      ) : (
        <div className="divide-y">
          {rows.map((r) => (
            <div key={r.profesionalId ?? r.profesional} className="flex items-center gap-3 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ background: color }}>
                {initials(r.profesional)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.profesional}</p>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${(r.cantidad / max) * 100}%`, background: color }} />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-heading text-lg font-bold tabular-nums">{r.cantidad}</span>
                <span className="ml-1 text-xs text-muted-foreground">{unidad}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReportePorProfesional() {
  const today = localDate();
  const [desde, setDesde] = React.useState(firstOfMonth);
  const [hasta, setHasta] = React.useState(today);
  const [sede, setSede] = React.useState("all");

  const sedeParam = sede !== "all" ? `&sedeId=${sede}` : "";
  const { data, loading, error, refetch } = useApiItem<PorProfesionalResponse>(
    `/reportes/por-profesional?desde=${desde}&hasta=${hasta}${sedeParam}`,
  );
  const isHoy = desde === today && hasta === today;
  const isMes = desde === firstOfMonth() && hasta === today;

  function exportarExcel() {
    if (!data) return;
    const rows = [
      ...data.consultasPorProfesional.map((r) => ["Consulta", r.profesional, r.cantidad]),
      ...data.ecografiasPorProfesional.map((r) => ["Ecografía", r.profesional, r.cantidad]),
    ];
    downloadCSV(`produccion-profesional_${desde}_a_${hasta}`, ["Categoría", "Profesional", "Cantidad"], rows);
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Reportes <span className="px-1">›</span>
        <span className="text-foreground">Producción por profesional</span>
      </p>
      <PageHeader
        title="Producción por profesional"
        description="Cuántas consultas y ecografías atendió cada profesional en el período."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportarExcel} disabled={!data}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" onClick={() => window.open(`/reporte-pdf/por-profesional?desde=${desde}&hasta=${hasta}${sedeParam}`, "_blank")}>
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
        <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-80 w-full rounded-2xl" /><Skeleton className="h-80 w-full rounded-2xl" /></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Ranking titulo="Consultas atendidas" rows={data.consultasPorProfesional} color="#0091d5" unidad="consultas" />
          <Ranking titulo="Ecografías realizadas" rows={data.ecografiasPorProfesional} color="#e6007e" unidad="ecos" />
        </div>
      )}
    </div>
  );
}
