"use client";

import * as React from "react";
import { CalendarClock, FileText, HeartPulse, Stethoscope } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calcAge, formatDate, formatPEN, initials } from "@/lib/format";
import { historialFor } from "@/lib/data/historial";
import type { Row } from "@/lib/resources/types";

function Dato({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export function PatientHistory({ patient }: { patient: Row }) {
  const nombre = `${patient.nombres ?? ""} ${patient.apellidos ?? ""}`.trim();
  const sexo = String(patient.sexo ?? "Femenino");
  const edad = patient.fechaNacimiento ? calcAge(String(patient.fechaNacimiento)) : null;
  const h = React.useMemo(
    () => historialFor(patient.id, sexo),
    [patient.id, sexo],
  );

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {/* Cabecera del paciente */}
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

      <Tabs defaultValue="resumen" className="p-3">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="atenciones">Atenc.</TabsTrigger>
          <TabsTrigger value="historias">Historias</TabsTrigger>
          <TabsTrigger value="resultados">Result.</TabsTrigger>
        </TabsList>

        {/* Resumen / antecedentes */}
        <TabsContent value="resumen" className="px-1">
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <HeartPulse className="h-3.5 w-3.5 text-brand" /> Antecedentes
            </p>
            <Dato label="Alergias" value={h.antecedentes.alergias} />
            <Dato label="Patológicos" value={h.antecedentes.patologicos} />
            <Dato label="Familiares" value={h.antecedentes.familiares} />
            <Dato label="Grupo sanguíneo" value={h.antecedentes.grupoSanguineo} />
            <Dato label="FUR" value={h.antecedentes.fur && formatDate(h.antecedentes.fur)} />
            <Dato label="Método actual" value={h.antecedentes.metodoActual} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3 text-center">
              <p className="font-heading text-xl font-bold">{h.atenciones.length}</p>
              <p className="text-xs text-muted-foreground">Atenciones</p>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <p className="font-heading text-xl font-bold">{h.resultados.length}</p>
              <p className="text-xs text-muted-foreground">Resultados</p>
            </div>
          </div>
        </TabsContent>

        {/* Atenciones previas */}
        <TabsContent value="atenciones" className="px-1">
          <ol className="relative space-y-3 border-l border-border pl-4">
            {h.atenciones.map((a, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[1.32rem] top-1.5 h-2 w-2 rounded-full bg-brand ring-4 ring-card" />
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {formatDate(a.fecha)}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${a.estado === "Pagado" ? "#16a34a" : "#f5a623"} 14%, transparent)`,
                      color: a.estado === "Pagado" ? "#16a34a" : "#f5a623",
                    }}
                  >
                    {a.estado}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {a.items.map((it) => (
                    <span key={it} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
                      {it}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.profesional} · {formatPEN(a.monto)}
                </p>
              </li>
            ))}
          </ol>
        </TabsContent>

        {/* Historias clínicas */}
        <TabsContent value="historias" className="space-y-2 px-1">
          {h.historias.map((hc, i) => (
            <div key={i} className="rounded-xl border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Stethoscope className="h-4 w-4 text-brand" />
                  {hc.especialidad}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(hc.fecha)}</span>
              </div>
              <p className="mt-1 text-sm">{hc.diagnostico}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{hc.especialista}</p>
            </div>
          ))}
        </TabsContent>

        {/* Resultados */}
        <TabsContent value="resultados" className="space-y-2 px-1">
          {h.resultados.map((r, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border p-2.5">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {r.tipo} · {formatDate(r.fecha)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px]">
                {r.estado}
              </span>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
