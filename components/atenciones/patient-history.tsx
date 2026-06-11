"use client";

import { CalendarClock, FileText, HeartPulse } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { calcAge, formatDate, formatPEN, initials } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import type { Row } from "@/lib/resources/types";

interface HistorialItem { kind: string; nombre: string; monto: number; abono: number; pago: string }
interface HistorialAtencion {
  id: number; fecha: string; origenValor?: string; total: number; estado: string; items: HistorialItem[];
}
interface HistorialResultado { nombre: string; tipo: string; fecha: string; estado: string }
interface Historial {
  antecedentes: { alergias?: string; antPatologicos?: string; antFamiliares?: string; grupoSanguineo?: string };
  atenciones: HistorialAtencion[];
  resultados: HistorialResultado[];
  stats: { atenciones: number; resultados: number };
}

const ESTADO_COLOR: Record<string, string> = {
  Pagado: "#16a34a",
  Parcial: "#f5a623",
  Pendiente: "#ef4444",
};

function Dato({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export function PatientHistory({ patient }: { patient: Row }) {
  const nombre = `${patient.nombres ?? ""} ${patient.apellidos ?? ""}`.trim();
  const sexo = String(patient.sexo ?? "Femenino");
  const edad = patient.fechaNacimiento ? calcAge(String(patient.fechaNacimiento)) : null;
  const { data: h, loading } = useApiItem<Historial>(
    patient.id ? `/pacientes/${patient.id}/historial` : null,
  );

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="bg-brand-gradient-soft p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-base font-bold text-white shadow-sm">
            {initials(nombre)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-base font-bold">{nombre}</p>
            <p className="text-xs text-muted-foreground">
              {String(patient.tipoDoc ?? "")} {String(patient.numDoc ?? "")}
              {edad != null && ` · ${edad} años`}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span
            className="rounded-full px-2 py-0.5 font-medium"
            style={{
              backgroundColor: `color-mix(in srgb, ${sexo === "Femenino" ? "#e6007e" : "#0091d5"} 16%, transparent)`,
              color: sexo === "Femenino" ? "#e6007e" : "#0091d5",
            }}
          >
            {sexo}
          </span>
          {Boolean(patient.telefono) && (
            <span className="rounded-full bg-background/60 px-2 py-0.5 text-muted-foreground">
              📞 {String(patient.telefono)}
            </span>
          )}
        </div>
      </div>

      {loading || !h ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
        </div>
      ) : (
        <Tabs defaultValue="resumen" className="p-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="atenciones">Atenc.</TabsTrigger>
            <TabsTrigger value="resultados">Result.</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="px-1">
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <HeartPulse className="h-3.5 w-3.5 text-brand" /> Antecedentes
              </p>
              <Dato label="Alergias" value={h.antecedentes.alergias} />
              <Dato label="Patológicos" value={h.antecedentes.antPatologicos} />
              <Dato label="Familiares" value={h.antecedentes.antFamiliares} />
              <Dato label="Grupo sanguíneo" value={h.antecedentes.grupoSanguineo} />
              {!h.antecedentes.alergias && !h.antecedentes.antPatologicos && !h.antecedentes.grupoSanguineo && (
                <p className="py-2 text-sm text-muted-foreground">Sin antecedentes registrados.</p>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-3 text-center">
                <p className="font-heading text-xl font-bold">{h.stats.atenciones}</p>
                <p className="text-xs text-muted-foreground">Atenciones</p>
              </div>
              <div className="rounded-xl border p-3 text-center">
                <p className="font-heading text-xl font-bold">{h.stats.resultados}</p>
                <p className="text-xs text-muted-foreground">Resultados</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="atenciones" className="px-1">
            {h.atenciones.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Sin atenciones previas.</p>
            ) : (
              <ol className="relative space-y-3 border-l border-border pl-4">
                {h.atenciones.map((a) => {
                  const color = ESTADO_COLOR[a.estado] ?? "#64748b";
                  return (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[1.32rem] top-1.5 h-2 w-2 rounded-full bg-brand ring-4 ring-card" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {formatDate(a.fecha)}
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                          {a.estado}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {a.items.map((it, i) => (
                          <span key={i} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{it.nombre}</span>
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.origenValor || "—"} · {formatPEN(a.total)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </TabsContent>

          <TabsContent value="resultados" className="space-y-2 px-1">
            {h.resultados.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Sin resultados.</p>
            ) : (
              h.resultados.map((r, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border p-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.nombre}</p>
                    <p className="text-xs text-muted-foreground">{r.tipo} · {formatDate(r.fecha)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px]">{r.estado}</span>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
