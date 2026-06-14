"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Baby, HeartPulse, Loader2, Save, Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { calcAge, formatDateLong, initials } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiItem, useApiList } from "@/lib/api/hooks";
import { type AntecedenteObstetrico, type Consulta } from "@/lib/api/consultas";
import type { Row } from "@/lib/resources/types";

const s = (v: unknown) => (v == null ? "" : String(v));

function Campo({ label, span, children }: { label: string; span?: 1 | 2; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", span === 2 && "sm:col-span-2")}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function AtenderForm({ consulta }: { consulta: Consulta }) {
  const router = useRouter();
  const prenatal = consulta.prenatal;
  const profesionales = useApiList<Row>("/profesionales");
  const { data: antExist } = useApiItem<AntecedenteObstetrico>(
    prenatal ? `/consultas/antecedentes/${consulta.pacienteId}` : null,
  );

  const h = consulta.historia;
  const c = consulta.control;
  const [form, setForm] = React.useState<Record<string, string>>(
    prenatal
      ? {
          semanaGestacional: s(c?.semanaGestacional), peso: s(c?.peso), presionArterial: s(c?.presionArterial),
          fcf: s(c?.fcf), alturaUterina: s(c?.alturaUterina), movimientosFetales: s(c?.movimientosFetales),
          edema: s(c?.edema), examenFisico: s(c?.examenFisico), diagnostico: s(c?.diagnostico),
          plan: s(c?.plan), proximaCita: s(c?.proximaCita), observaciones: s(c?.observaciones),
        }
      : {
          motivo: s(h?.motivo), presionArterial: s(h?.presionArterial), pulso: s(h?.pulso), temperatura: s(h?.temperatura),
          peso: s(h?.peso), talla: s(h?.talla), examenFisico: s(h?.examenFisico),
          diagnosticoPresuntivo: s(h?.diagnosticoPresuntivo), diagnosticoDefinitivo: s(h?.diagnosticoDefinitivo),
          cie: s(h?.cie), plan: s(h?.plan), observaciones: s(h?.observaciones), proximaCita: s(h?.proximaCita),
        },
  );
  const [ant, setAnt] = React.useState<Record<string, string>>({});
  const [especialistaId, setEspecialistaId] = React.useState<string>(s(consulta.especialistaId));
  const [saving, setSaving] = React.useState(false);
  const antLoaded = React.useRef(false);

  React.useEffect(() => {
    if (prenatal && antExist && !antLoaded.current) {
      antLoaded.current = true;
      setAnt({
        gestas: s(antExist.gestas), partos: s(antExist.partos), abortos: s(antExist.abortos),
        cesareas: s(antExist.cesareas), hijosVivos: s(antExist.hijosVivos),
        fum: antExist.fum ? String(antExist.fum).slice(0, 10) : "", fpp: antExist.fpp ? String(antExist.fpp).slice(0, 10) : "",
        tipoSangre: s(antExist.tipoSangre),
      });
    }
  }, [prenatal, antExist]);

  const g = (k: string) => form[k] ?? "";
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const ga = (k: string) => ant[k] ?? "";
  const sa = (k: string, v: string) => setAnt((f) => ({ ...f, [k]: v }));

  const nombre = `${consulta.paciente?.nombres ?? ""} ${consulta.paciente?.apellidos ?? ""}`.trim();
  const edad = consulta.paciente?.fechaNacimiento ? calcAge(String(consulta.paciente.fechaNacimiento)) : null;

  async function guardar() {
    setSaving(true);
    try {
      const espId = especialistaId ? Number(especialistaId) : undefined;
      if (prenatal) {
        await api.put(`/consultas/antecedentes/${consulta.pacienteId}`, {
          gestas: ga("gestas") ? Number(ga("gestas")) : undefined,
          partos: ga("partos") ? Number(ga("partos")) : undefined,
          abortos: ga("abortos") ? Number(ga("abortos")) : undefined,
          cesareas: ga("cesareas") ? Number(ga("cesareas")) : undefined,
          hijosVivos: ga("hijosVivos") ? Number(ga("hijosVivos")) : undefined,
          fum: ga("fum") || undefined, fpp: ga("fpp") || undefined, tipoSangre: ga("tipoSangre") || undefined,
        });
        await api.post(`/consultas/${consulta.id}/control`, {
          semanaGestacional: g("semanaGestacional") ? Number(g("semanaGestacional")) : undefined,
          peso: g("peso") || undefined, presionArterial: g("presionArterial") || undefined, fcf: g("fcf") || undefined,
          alturaUterina: g("alturaUterina") || undefined, movimientosFetales: g("movimientosFetales") || undefined,
          edema: g("edema") || undefined, examenFisico: g("examenFisico") || undefined, diagnostico: g("diagnostico") || undefined,
          plan: g("plan") || undefined, proximaCita: g("proximaCita") || undefined, observaciones: g("observaciones") || undefined,
          especialistaId: espId,
        });
      } else {
        await api.post(`/consultas/${consulta.id}/historia`, {
          motivo: g("motivo") || undefined, presionArterial: g("presionArterial") || undefined, pulso: g("pulso") || undefined,
          temperatura: g("temperatura") || undefined, peso: g("peso") || undefined, talla: g("talla") || undefined,
          examenFisico: g("examenFisico") || undefined, diagnosticoPresuntivo: g("diagnosticoPresuntivo") || undefined,
          diagnosticoDefinitivo: g("diagnosticoDefinitivo") || undefined, cie: g("cie") || undefined,
          plan: g("plan") || undefined, observaciones: g("observaciones") || undefined, proximaCita: g("proximaCita") || undefined,
          especialistaId: espId,
        });
      }
      toast.success("Consulta atendida y guardada");
      router.push("/consultas/lista");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-2 text-sm text-muted-foreground">
        Consultas <span className="px-1">›</span>
        <button onClick={() => router.push("/consultas/lista")} className="hover:text-foreground">Lista</button>
        <span className="px-1">›</span>
        <span className="text-foreground">Atender</span>
      </p>
      <PageHeader
        title={prenatal ? "Control prenatal" : "Historia clínica"}
        actions={
          <Button variant="outline" onClick={() => router.push("/consultas/lista")}>
            <ArrowLeft className="h-4 w-4" />Volver
          </Button>
        }
      />

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-base font-bold text-white">{initials(nombre)}</span>
            <div>
              <p className="font-heading text-base font-bold">{nombre}</p>
              <p className="text-sm text-muted-foreground">
                {consulta.paciente?.numDoc}{edad != null && ` · ${edad} años`} · {consulta.tipoNombre}
              </p>
            </div>
          </div>
          <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: "color-mix(in srgb, #e6007e 12%, transparent)", color: "#e6007e" }}>
            {formatDateLong(consulta.fecha)}
          </span>
        </CardContent>
      </Card>

      {prenatal && (
        <Card className="mb-5">
          <CardHeader><CardTitle className="flex items-center gap-2"><Baby className="h-4 w-4 text-brand" /> Antecedentes obstétricos</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
            <Campo label="Gestas"><Input type="number" value={ga("gestas")} onChange={(e) => sa("gestas", e.target.value)} /></Campo>
            <Campo label="Partos"><Input type="number" value={ga("partos")} onChange={(e) => sa("partos", e.target.value)} /></Campo>
            <Campo label="Abortos"><Input type="number" value={ga("abortos")} onChange={(e) => sa("abortos", e.target.value)} /></Campo>
            <Campo label="Cesáreas"><Input type="number" value={ga("cesareas")} onChange={(e) => sa("cesareas", e.target.value)} /></Campo>
            <Campo label="Hijos vivos"><Input type="number" value={ga("hijosVivos")} onChange={(e) => sa("hijosVivos", e.target.value)} /></Campo>
            <Campo label="FUM"><Input type="date" value={ga("fum")} onChange={(e) => sa("fum", e.target.value)} /></Campo>
            <Campo label="FPP"><Input type="date" value={ga("fpp")} onChange={(e) => sa("fpp", e.target.value)} /></Campo>
            <Campo label="Tipo de sangre"><Input value={ga("tipoSangre")} onChange={(e) => sa("tipoSangre", e.target.value)} placeholder="O+" /></Campo>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {prenatal ? <Stethoscope className="h-4 w-4 text-brand" /> : <HeartPulse className="h-4 w-4 text-brand" />}
            {prenatal ? "Control de la gestación" : "Evaluación clínica"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {!prenatal && (
            <Campo label="Motivo de consulta" span={2}>
              <Textarea value={g("motivo")} onChange={(e) => set("motivo", e.target.value)} rows={2} placeholder="Motivo / anamnesis…" />
            </Campo>
          )}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signos vitales</p>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
              {prenatal && <Campo label="Semana gestacional"><Input type="number" value={g("semanaGestacional")} onChange={(e) => set("semanaGestacional", e.target.value)} /></Campo>}
              <Campo label="Presión arterial"><Input value={g("presionArterial")} onChange={(e) => set("presionArterial", e.target.value)} placeholder="120/80" /></Campo>
              {!prenatal && <Campo label="Pulso"><Input value={g("pulso")} onChange={(e) => set("pulso", e.target.value)} placeholder="72" /></Campo>}
              {!prenatal && <Campo label="Temperatura"><Input value={g("temperatura")} onChange={(e) => set("temperatura", e.target.value)} placeholder="36.5" /></Campo>}
              <Campo label="Peso (kg)"><Input value={g("peso")} onChange={(e) => set("peso", e.target.value)} /></Campo>
              {!prenatal && <Campo label="Talla (m)"><Input value={g("talla")} onChange={(e) => set("talla", e.target.value)} placeholder="1.60" /></Campo>}
              {prenatal && <Campo label="FCF (lpm)"><Input value={g("fcf")} onChange={(e) => set("fcf", e.target.value)} placeholder="140" /></Campo>}
              {prenatal && <Campo label="Altura uterina (cm)"><Input value={g("alturaUterina")} onChange={(e) => set("alturaUterina", e.target.value)} /></Campo>}
              {prenatal && <Campo label="Movimientos fetales"><Input value={g("movimientosFetales")} onChange={(e) => set("movimientosFetales", e.target.value)} placeholder="Presentes" /></Campo>}
              {prenatal && <Campo label="Edema"><Input value={g("edema")} onChange={(e) => set("edema", e.target.value)} placeholder="No" /></Campo>}
            </div>
          </div>

          <Campo label="Examen físico" span={2}>
            <Textarea value={g("examenFisico")} onChange={(e) => set("examenFisico", e.target.value)} rows={2} />
          </Campo>

          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            {prenatal ? (
              <Campo label="Diagnóstico" span={2}><Textarea value={g("diagnostico")} onChange={(e) => set("diagnostico", e.target.value)} rows={2} /></Campo>
            ) : (
              <>
                <Campo label="Diagnóstico presuntivo"><Input value={g("diagnosticoPresuntivo")} onChange={(e) => set("diagnosticoPresuntivo", e.target.value)} /></Campo>
                <Campo label="Diagnóstico definitivo"><Input value={g("diagnosticoDefinitivo")} onChange={(e) => set("diagnosticoDefinitivo", e.target.value)} /></Campo>
                <Campo label="CIE-10"><Input value={g("cie")} onChange={(e) => set("cie", e.target.value)} placeholder="Ej. Z01.4" /></Campo>
              </>
            )}
          </div>

          <Campo label="Plan / tratamiento" span={2}>
            <Textarea value={g("plan")} onChange={(e) => set("plan", e.target.value)} rows={2} />
          </Campo>

          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            <Campo label="Próxima cita"><Input value={g("proximaCita")} onChange={(e) => set("proximaCita", e.target.value)} placeholder="En 4 semanas" /></Campo>
            <Campo label="Especialista">
              <Select value={especialistaId || undefined} onValueChange={setEspecialistaId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Asignar especialista…" /></SelectTrigger>
                <SelectContent>
                  {profesionales.data.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {String(p.nombres)} {String(p.apellidos)}{p.especialidad ? ` · ${String(p.especialidad)}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
          </div>

          <Campo label="Observaciones" span={2}>
            <Textarea value={g("observaciones")} onChange={(e) => set("observaciones", e.target.value)} rows={2} />
          </Campo>

          <Button className="h-11 w-full bg-brand-gradient text-white" onClick={guardar} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar y marcar como atendida
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function AtenderConsulta({ id }: { id: number }) {
  const router = useRouter();
  const { data: consulta, loading } = useApiItem<Consulta>(id ? `/consultas/${id}` : null);

  if (loading) return <div className="mx-auto max-w-3xl"><Skeleton className="h-[32rem] w-full rounded-2xl" /></div>;
  if (!consulta) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-dashed py-20 text-center text-muted-foreground">
        No se encontró la consulta.
        <div className="mt-4"><Button variant="outline" onClick={() => router.push("/consultas/lista")}>Volver</Button></div>
      </div>
    );
  }
  return <AtenderForm consulta={consulta} />;
}
