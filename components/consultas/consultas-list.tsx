"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, FileText, Search, Stethoscope, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, initials } from "@/lib/format";
import { useApiList } from "@/lib/api/hooks";
import { type Consulta } from "@/lib/api/consultas";

const ESTADO_COLOR: Record<string, string> = {
  Pendiente: "#f5a623",
  Atendida: "#16a34a",
};

export function ConsultasList() {
  const router = useRouter();
  const { data: consultas, loading, error, refetch } = useApiList<Consulta>("/consultas");
  const [estado, setEstado] = React.useState<"Todas" | "Pendiente" | "Atendida">("Pendiente");
  const [query, setQuery] = React.useState("");

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return consultas
      .filter((c) => (estado === "Todas" ? true : c.estado === estado))
      .filter((c) =>
        !q ? true : `${c.paciente?.nombres} ${c.paciente?.apellidos} ${c.tipoNombre}`.toLowerCase().includes(q),
      );
  }, [consultas, estado, query]);

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Consultas <span className="px-1">›</span>
        <span className="text-foreground">Lista de Consultas</span>
      </p>
      <PageHeader title="Consultas" description="Consultas registradas desde las atenciones, listas para atender." />

      <div className="rounded-2xl border bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          {(["Pendiente", "Atendida", "Todas"] as const).map((e) => (
            <Button
              key={e}
              size="sm"
              variant={estado === e ? "default" : "outline"}
              className={cn("h-9", estado === e && "bg-brand text-white hover:bg-brand/90")}
              onClick={() => setEstado(e)}
            >
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
            {estado === "Pendiente" ? "No hay consultas pendientes. 🎉" : "No hay consultas en este filtro."}
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
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                        {c.estado}
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        className={cn(c.estado === "Pendiente" ? "bg-brand-gradient text-white" : "")}
                        variant={c.estado === "Pendiente" ? "default" : "outline"}
                        onClick={() => router.push(`/consultas/${c.id}/atender`)}
                      >
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
