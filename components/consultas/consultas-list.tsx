"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CalendarDays, FileText, Search, Stethoscope, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, initials } from "@/lib/format";
import { useApiList } from "@/lib/api/hooks";
import { useSedeFiltro } from "@/lib/auth/store";
import { type Consulta } from "@/lib/api/consultas";

const ESTADO_COLOR: Record<string, string> = { Pendiente: "#f5a623", Atendida: "#16a34a" };

function localDate(d: Date = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function ConsultasList() {
  const router = useRouter();
  const sedeId = useSedeFiltro();
  const { data: consultas, loading, error, refetch } = useApiList<Consulta>(`/consultas${sedeId ? `?sedeId=${sedeId}` : ""}`);
  const today = localDate();
  const [estado, setEstado] = React.useState<"Todas" | "Pendiente" | "Atendida">("Todas");
  const [desde, setDesde] = React.useState(today);
  const [hasta, setHasta] = React.useState(today);
  const [query, setQuery] = React.useState("");

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return consultas
      .filter((c) => {
        const f = localDate(new Date(c.fecha));
        if (desde && f < desde) return false;
        if (hasta && f > hasta) return false;
        return true;
      })
      .filter((c) => (estado === "Todas" ? true : c.estado === estado))
      .filter((c) => (!q ? true : `${c.paciente?.nombres} ${c.paciente?.apellidos} ${c.tipoNombre}`.toLowerCase().includes(q)))
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
  }, [consultas, estado, desde, hasta, query]);

  const isHoy = desde === today && hasta === today;
  const isTodas = !desde && !hasta;

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Consultas <span className="px-1">›</span>
        <span className="text-foreground">Lista de Consultas</span>
      </p>
      <PageHeader title="Consultas" description="Consultas registradas desde las atenciones, listas para atender." />

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
          <Button variant={isHoy ? "default" : "outline"} size="sm" className={cn("h-9", isHoy && "bg-brand text-white hover:bg-brand/90")} onClick={() => { setDesde(today); setHasta(today); }}>
            <CalendarDays className="h-4 w-4" /> Hoy
          </Button>
          <Button variant={isTodas ? "default" : "outline"} size="sm" className={cn("h-9", isTodas && "bg-brand text-white hover:bg-brand/90")} onClick={() => { setDesde(""); setHasta(""); }}>
            Todas las fechas
          </Button>
          <div className="mx-1 h-9 w-px bg-border" />
          {(["Todas", "Pendiente", "Atendida"] as const).map((e) => (
            <Button key={e} size="sm" variant={estado === e ? "default" : "outline"} className={cn("h-9", estado === e && "bg-brand text-white hover:bg-brand/90")} onClick={() => setEstado(e)}>
              {e === "Pendiente" ? "Pendientes" : e === "Atendida" ? "Atendidas" : "Todas"}
            </Button>
          ))}
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar paciente o tipo…" className="h-9 pl-9" />
          </div>
          <span className="text-sm text-muted-foreground">{rows.length} registro{rows.length === 1 ? "" : "s"}</span>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <TriangleAlert className="h-6 w-6 text-destructive" />No se pudo cargar la información.
            <Button variant="outline" size="sm" onClick={refetch} className="mt-1">Reintentar</Button>
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {isHoy ? "No hay consultas para hoy." : "No hay consultas en este filtro."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Fecha</TableHead>
                <TableHead className="text-xs">Paciente</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Especialista</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => {
                const nombre = `${c.paciente?.nombres ?? ""} ${c.paciente?.apellidos ?? ""}`.trim();
                const color = ESTADO_COLOR[c.estado] ?? "#64748b";
                const esp = c.especialista ? `${c.especialista.nombres} ${c.especialista.apellidos}` : "—";
                return (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`/consultas/${c.id}/atender`)}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" />{formatDate(c.fecha)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft text-xs font-bold text-brand">{initials(nombre)}</span>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{nombre}</div>
                          <div className="text-xs text-muted-foreground">{c.paciente?.numDoc}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{c.tipoNombre}</span>
                      {c.prenatal && <span className="ml-1.5 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">prenatal</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{esp}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>{c.estado}</span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(ev) => ev.stopPropagation()}>
                      <Button size="sm" className={cn(c.estado === "Pendiente" ? "bg-brand-gradient text-white" : "")} variant={c.estado === "Pendiente" ? "default" : "outline"} onClick={() => router.push(`/consultas/${c.id}/atender`)}>
                        {c.prenatal ? <Stethoscope className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        {c.estado === "Pendiente" ? "Atender" : "Ver"}
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
