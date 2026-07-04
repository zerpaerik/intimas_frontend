"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  Download,
  FileText,
  Paperclip,
  Printer,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, initials } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiList } from "@/lib/api/hooks";
import { useSedeFiltro } from "@/lib/auth/store";
import { API_URL } from "@/lib/config";
import { esArchivo, type Resultado, type Track } from "@/lib/api/resultados";

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function ResultadosGuardados({ track }: { track: Track }) {
  const sedeId = useSedeFiltro();
  // Por defecto solo el día en curso; los filtros de fecha permiten ubicar otros días.
  const [desde, setDesde] = React.useState(() => iso(new Date()));
  const [hasta, setHasta] = React.useState(() => iso(new Date()));
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [pendingDelete, setPendingDelete] = React.useState<Resultado | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const path =
    `/resultados/guardados?track=${track}` +
    (desde ? `&desde=${desde}` : "") +
    (hasta ? `&hasta=${hasta}` : "") +
    (sedeId ? `&sedeId=${sedeId}` : "") +
    (debounced.length >= 2 ? `&search=${encodeURIComponent(debounced)}` : "");

  const { data: rows, loading, error, refetch } = useApiList<Resultado>(path);

  const esLab = track === "lab";
  const title = esLab ? "Guardados — Laboratorio" : "Guardados — Servicios y Ecografías";

  function verInforme(r: Resultado) {
    window.open(`/comprobante-resultado/${r.id}`, "_blank");
  }
  function verArchivo(r: Resultado) {
    window.open(`${API_URL}/resultados/${r.id}/archivo`, "_blank");
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.del(`/resultados/${pendingDelete.id}`);
      toast.success("Resultado eliminado · el estudio vuelve a pendientes");
      setPendingDelete(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader title={title} description="Resultados ya registrados. Puedes verlos, imprimirlos o descargarlos." />

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
          <span className="text-sm text-muted-foreground">{rows.length} resultado{rows.length === 1 ? "" : "s"}</span>
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
          <div className="py-16 text-center text-sm text-muted-foreground">Aún no hay resultados guardados en este rango.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Fecha</TableHead>
                <TableHead className="text-xs">Paciente</TableHead>
                <TableHead className="text-xs">Estudio</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Tipo</TableHead>
                <TableHead className="text-right text-xs">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const nombre = `${r.paciente?.nombres ?? ""} ${r.paciente?.apellidos ?? ""}`.trim();
                const archivo = esArchivo(r);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatDate(r.fechaResultado)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft text-xs font-bold text-brand">
                          {initials(nombre)}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{nombre}</div>
                          <div className="text-xs text-muted-foreground">{r.paciente?.tipoDoc} {r.paciente?.numDoc}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.nombre}</div>
                      <div className="text-xs text-muted-foreground">{r.tipo}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {archivo ? <Paperclip className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                        {archivo ? "Archivo" : "Informe"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {archivo ? (
                          <Button size="sm" variant="outline" onClick={() => verArchivo(r)}>
                            <Download className="h-4 w-4" /> Ver archivo
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => verInforme(r)}>
                            <Printer className="h-4 w-4" /> Ver / Imprimir
                          </Button>
                        )}
                        <Button size="icon-sm" variant="ghost" title="Eliminar" onClick={() => setPendingDelete(r)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este resultado?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el resultado de <b>{pendingDelete?.nombre}</b>
              {pendingDelete?.paciente ? ` de ${pendingDelete.paciente.nombres} ${pendingDelete.paciente.apellidos}` : ""}. El estudio volverá a la cola de pendientes para poder rehacerlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} disabled={deleting} className="bg-destructive text-white hover:bg-destructive/90">
              {deleting ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
