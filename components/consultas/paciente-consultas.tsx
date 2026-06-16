"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Baby, FileText, Printer, Stethoscope, UserSearch } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { calcAge, formatDate, initials } from "@/lib/format";
import { useApiList } from "@/lib/api/hooks";
import { type Consulta } from "@/lib/api/consultas";
import { PatientSearch } from "@/components/atenciones/patient-search";
import type { Row } from "@/lib/resources/types";

const ESTADO_COLOR: Record<string, string> = { Pendiente: "#f5a623", Atendida: "#16a34a" };

/** Vista por paciente: busca → muestra detalle + sus historias o controles (ver / atender / imprimir). */
export function PacienteConsultas({ tipo }: { tipo: "historia" | "control" }) {
  const router = useRouter();
  const esControl = tipo === "control";
  const [patient, setPatient] = React.useState<Row | null>(null);
  const pid = patient?.id ? Number(patient.id) : null;
  const { data, loading } = useApiList<Consulta>(pid ? `/consultas?pacienteId=${pid}` : null);

  const rows = React.useMemo(
    () => data.filter((c) => (esControl ? c.prenatal : !c.prenatal)).sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)),
    [data, esControl],
  );

  const nombre = patient ? `${patient.nombres ?? ""} ${patient.apellidos ?? ""}`.trim() : "";
  const edad = patient?.fechaNacimiento ? calcAge(String(patient.fechaNacimiento)) : null;
  const printBase = esControl ? "/comprobante-control" : "/comprobante-historia";

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Consultas <span className="px-1">›</span>
        <span className="text-foreground">{esControl ? "Ver Controles" : "Ver Historias"}</span>
      </p>
      <PageHeader
        title={esControl ? "Controles prenatales" : "Historias clínicas"}
        description={`Busca un paciente para ver, atender o imprimir sus ${esControl ? "controles / carné" : "historias clínicas"}.`}
      />

      <Card className="mb-5">
        <CardContent className="pt-6">
          <PatientSearch value={patient} onSelect={setPatient} />
        </CardContent>
      </Card>

      {!patient ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/40 px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft">
            {esControl ? <Baby className="h-7 w-7 text-brand" /> : <UserSearch className="h-7 w-7 text-brand" />}
          </div>
          <p className="font-heading font-semibold">Busca un paciente</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Selecciona un paciente para ver sus {esControl ? "controles prenatales y carné" : "historias clínicas"} e imprimirlos.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center gap-3 border-b p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white">{initials(nombre)}</span>
            <div>
              <p className="font-heading font-bold">{nombre}</p>
              <p className="text-sm text-muted-foreground">{String(patient.tipoDoc ?? "")} {String(patient.numDoc ?? "")}{edad != null && ` · ${edad} años`}</p>
            </div>
            <span className="ml-auto text-sm text-muted-foreground">{rows.length} registro{rows.length === 1 ? "" : "s"}</span>
          </div>

          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
          ) : rows.length === 0 ? (
            <div className="py-14 text-center text-sm text-muted-foreground">
              Este paciente no tiene {esControl ? "controles prenatales" : "historias"} registrados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Fecha</TableHead>
                  <TableHead className="text-xs">Tipo</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Especialista</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-right text-xs">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => {
                  const color = ESTADO_COLOR[c.estado] ?? "#64748b";
                  const esp = c.especialista ? `${c.especialista.nombres} ${c.especialista.apellidos}` : "—";
                  const atendida = c.estado === "Atendida";
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(c.fecha)}</TableCell>
                      <TableCell>
                        <span className="font-medium">{c.tipoNombre}</span>
                        {c.prenatal && <span className="ml-1.5 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">prenatal</span>}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{esp}</TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>{c.estado}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant={atendida ? "outline" : "default"} className={cn(!atendida && "bg-brand-gradient text-white")} onClick={() => router.push(`/consultas/${c.id}/atender`)}>
                            {esControl ? <Stethoscope className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                            {atendida ? "Ver" : "Atender"}
                          </Button>
                          {atendida && (
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => window.open(`${printBase}/${c.id}`, "_blank")} aria-label="Imprimir">
                              <Printer className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
