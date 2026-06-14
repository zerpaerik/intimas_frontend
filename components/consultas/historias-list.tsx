"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDate, initials } from "@/lib/format";
import { useApiList } from "@/lib/api/hooks";
import { type HistoriaClinica, type ConsultaPaciente, type ConsultaEspecialista } from "@/lib/api/consultas";

interface HistoriaRow extends HistoriaClinica {
  consulta: { id: number; paciente: ConsultaPaciente; especialista?: ConsultaEspecialista | null };
}

export function HistoriasList() {
  const router = useRouter();
  const { data, loading, error, refetch } = useApiList<HistoriaRow>("/consultas/historias");
  const [query, setQuery] = React.useState("");

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return !q
      ? data
      : data.filter((h) => `${h.consulta?.paciente?.nombres} ${h.consulta?.paciente?.apellidos}`.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Consultas <span className="px-1">›</span>
        <span className="text-foreground">Ver Historias</span>
      </p>
      <PageHeader title="Historias clínicas" description="Historias registradas en las consultas atendidas." />

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center gap-3 border-b p-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar paciente…" className="h-9 pl-9" />
          </div>
          <span className="ml-auto text-sm text-muted-foreground">{rows.length} registro{rows.length === 1 ? "" : "s"}</span>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <TriangleAlert className="h-6 w-6 text-destructive" />No se pudo cargar.
            <Button variant="outline" size="sm" onClick={refetch} className="mt-1">Reintentar</Button>
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Aún no hay historias registradas.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Fecha</TableHead>
                <TableHead className="text-xs">Paciente</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Motivo</TableHead>
                <TableHead className="text-xs">Diagnóstico</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Especialista</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((h) => {
                const p = h.consulta?.paciente;
                const nombre = `${p?.nombres ?? ""} ${p?.apellidos ?? ""}`.trim();
                const esp = h.consulta?.especialista ? `${h.consulta.especialista.nombres} ${h.consulta.especialista.apellidos}` : "—";
                return (
                  <TableRow key={h.id} className="cursor-pointer" onClick={() => router.push(`/consultas/${h.consultaId}/atender`)}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(h.fecha)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft text-xs font-bold text-brand">{initials(nombre)}</span>
                        <span className="font-medium">{nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{h.motivo || "—"}</TableCell>
                    <TableCell>{h.diagnosticoDefinitivo || h.diagnosticoPresuntivo || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{esp}</TableCell>
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
