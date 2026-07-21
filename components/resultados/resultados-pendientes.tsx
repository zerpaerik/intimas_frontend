"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, FilePenLine, Search, TriangleAlert, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, initials } from "@/lib/format";
import { useApiList } from "@/lib/api/hooks";
import { useSedeFiltro } from "@/lib/auth/store";
import type { ResultadoPendiente, Track } from "@/lib/api/resultados";
import { UploadDialog } from "./upload-dialog";

const KIND_COLOR: Record<string, string> = {
  Laboratorio: "#f5a623",
  "Ecografía": "#e6007e",
  "Rayos X": "#0091d5",
  "Salud Mental": "#7c3aed",
  Otros: "#00b8a9",
  Servicio: "#0091d5",
};

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function ResultadosPendientes({ track }: { track: Track }) {
  const router = useRouter();
  const sedeId = useSedeFiltro();
  // Por defecto solo el día en curso (evita inundarse con el histórico); los filtros de fecha permiten ver otros días.
  const [desde, setDesde] = React.useState(() => iso(new Date()));
  const [hasta, setHasta] = React.useState(() => iso(new Date()));
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const path =
    `/resultados/pendientes?track=${track}` +
    (desde ? `&desde=${desde}` : "") +
    (hasta ? `&hasta=${hasta}` : "") +
    (sedeId ? `&sedeId=${sedeId}` : "") +
    (debounced.length >= 2 ? `&search=${encodeURIComponent(debounced)}` : "");

  const { data: rows, loading, error, refetch } = useApiList<ResultadoPendiente>(path);

  const esLab = track === "lab";
  const title = esLab ? "Pendientes — Laboratorio" : "Pendientes — Ecografías";
  const description = esLab
    ? "Análisis registrados a la espera de que llegue su resultado."
    : "Ecografías registradas a la espera de su informe (otros servicios no generan informe).";

  return (
    <div>
      <PageHeader title={title} description={description} />

      <div className="rounded-2xl border bg-card">
        <div className="flex flex-wrap items-end gap-3 border-b p-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Desde</Label>
            <Input type="date" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} className="h-9 w-[9.5rem]" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hasta</Label>
            <Input type="date" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} className="h-9 w-[9.5rem]" />
          </div>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar paciente…" className="h-9 pl-9" />
          </div>
          <span className="text-sm text-muted-foreground">{rows.length} pendiente{rows.length === 1 ? "" : "s"}</span>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <TriangleAlert className="h-6 w-6 text-destructive" />
            No se pudo cargar la información.
            <Button variant="outline" size="sm" onClick={refetch} className="mt-1">Reintentar</Button>
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No hay estudios pendientes en este rango. 🎉
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Fecha</TableHead>
                <TableHead className="text-xs">Paciente</TableHead>
                <TableHead className="text-xs">Estudio</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Origen</TableHead>
                <TableHead className="text-right text-xs">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const nombre = `${r.paciente?.nombres ?? ""} ${r.paciente?.apellidos ?? ""}`.trim();
                const color = KIND_COLOR[r.kind] ?? "#64748b";
                return (
                  <TableRow key={r.itemId}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatDate(r.fecha)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft text-xs font-bold text-brand">
                          {initials(nombre)}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.paciente?.tipoDoc} {r.paciente?.numDoc}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.nombre}</div>
                      <span
                        className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
                      >
                        {r.kind}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {r.origenTipo}{r.origenValor ? ` · ${r.origenValor}` : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Laboratorio: solo se adjunta el archivo del lab (no se redacta in-app). */}
                        {!esLab && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-brand-gradient text-white"
                            onClick={() => router.push(`/resultados/redactar/${r.itemId}`)}
                          >
                            <FilePenLine className="h-4 w-4" /> Redactar
                          </Button>
                        )}
                        <UploadDialog
                          item={r}
                          onDone={refetch}
                          trigger={
                            <Button size="sm" variant={esLab ? "default" : "outline"} className={cn(esLab && "bg-brand-gradient text-white")}>
                              <Upload className="h-4 w-4" /> Adjuntar
                            </Button>
                          }
                        />
                      </div>
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
