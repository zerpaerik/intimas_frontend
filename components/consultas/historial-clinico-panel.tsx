"use client";

import * as React from "react";
import { Baby, FileText, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { useApiList } from "@/lib/api/hooks";
import type { ControlPrenatal, Diagnostico, HistoriaClinica } from "@/lib/api/consultas";

type HRow = HistoriaClinica & { diagnosticos?: Diagnostico[] };
type CRow = ControlPrenatal;

/** Historial clínico previo del paciente (historias + controles), con enlace a imprimir. */
export function HistorialClinicoPanel({
  pacienteId,
  excludeConsultaId,
  title = "Historial clínico previo",
}: {
  pacienteId?: number;
  excludeConsultaId?: number;
  title?: string;
}) {
  const historias = useApiList<HRow>(pacienteId ? `/consultas/historias?pacienteId=${pacienteId}` : null);
  const controles = useApiList<CRow>(pacienteId ? `/consultas/controles?pacienteId=${pacienteId}` : null);
  const loading = historias.loading || controles.loading;

  const items = React.useMemo(() => {
    const hs = historias.data.map((h) => ({
      kind: "Historia" as const,
      fecha: h.fecha,
      consultaId: h.consultaId,
      label: h.diagnosticos?.[0] ? `${h.diagnosticos[0].cie10} · ${h.diagnosticos[0].descripcion ?? ""}` : (h.enfRelato ?? "Historia clínica"),
      href: `/comprobante-historia/${h.consultaId}`,
    }));
    const cs = controles.data.map((c) => ({
      kind: "Control" as const,
      fecha: c.fecha,
      consultaId: c.consultaId,
      label: `${c.semanaGestacional != null ? `${c.semanaGestacional} sem · ` : ""}${c.diagnostico ?? "Control prenatal"}`,
      href: `/comprobante-control/${c.consultaId}`,
    }));
    return [...hs, ...cs]
      .filter((x) => x.consultaId !== excludeConsultaId)
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
  }, [historias.data, controles.data, excludeConsultaId]);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="border-b bg-brand-gradient-soft p-4">
        <p className="font-heading text-sm font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">Registros anteriores del paciente</p>
      </div>
      {loading ? (
        <div className="space-y-2 p-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
      ) : items.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">Sin registros previos.</p>
      ) : (
        <ol className="max-h-[30rem] divide-y overflow-auto">
          {items.map((x, i) => (
            <li key={i} className="flex items-start gap-2 p-3 text-sm">
              <span className="mt-0.5 shrink-0 text-muted-foreground">{x.kind === "Control" ? <Baby className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{formatDate(x.fecha)}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">{x.kind}</span>
                </div>
                <div className="truncate text-muted-foreground">{x.label || "—"}</div>
              </div>
              <a href={x.href} target="_blank" rel="noreferrer" className="shrink-0 text-muted-foreground transition-colors hover:text-brand" aria-label="Imprimir">
                <Printer className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
