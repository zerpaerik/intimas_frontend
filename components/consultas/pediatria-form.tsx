"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Baby, Lock, Printer } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { calcAge, formatDateLong, initials } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiList } from "@/lib/api/hooks";
import { type Consulta } from "@/lib/api/consultas";
import type { Row } from "@/lib/resources/types";
import { HistorialClinicoPanel } from "./historial-clinico-panel";
import { AccionesCierre } from "./acciones-cierre";

const ACCENT = "#0c447c";
const v = (x: unknown) => (x == null ? "" : String(x));

function Campo({ label, span, children }: { label: string; span?: 1 | 2 | 3 | 4; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", span === 2 && "sm:col-span-2", span === 3 && "sm:col-span-3", span === 4 && "sm:col-span-4")}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// Todos los campos de texto de la historia pediátrica
const CAMPOS = [
  "informante", "lugarNacimiento", "procedencia", "seguro", "madreNombre", "padreNombre", "servicioIngreso", "referido", "cama",
  "motivoConsulta", "tiempoEnfermedad", "formaInicio", "relato", "datosNegativos", "funcionesBiologicas", "revisionSistemas",
  "antPerinatales", "pesoNacer", "tallaNacer", "apgar", "antNutricionales", "desarrollo", "escolaridad", "inmunizaciones", "antPatologicos",
  "antFamiliares", "antSocioeconomicos",
  "peso", "talla", "pc", "perimetroAbdominal", "imc", "fc", "fr", "ta", "temperatura", "percentiles", "inspeccionGeneral",
  "dxPatologia", "dxCrecimiento", "planEstudio", "planManejo",
] as const;

export function PediatriaForm({ consulta }: { consulta: Consulta }) {
  const router = useRouter();
  const profesionales = useApiList<Row>("/profesionales");
  const pd = consulta.pediatrica;
  const p = consulta.paciente;
  const cerrada = !!pd?.cerrada;

  const [form, setForm] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of CAMPOS) init[k] = v((pd as Record<string, unknown> | null | undefined)?.[k]);
    return init;
  });
  const [especialistaId, setEspecialistaId] = React.useState(v(consulta.especialistaId));
  const [saving, setSaving] = React.useState(false);

  const g = (k: string) => form[k] ?? "";
  const set = (k: string, val: string) => setForm((f) => ({ ...f, [k]: val }));

  const nombre = `${p?.nombres ?? ""} ${p?.apellidos ?? ""}`.trim();
  const edad = p?.fechaNacimiento ? calcAge(String(p.fechaNacimiento)) : null;
  const esp = profesionales.data.find((x) => String(x.id) === especialistaId);

  async function guardar(cerrar: boolean) {
    if (!g("motivoConsulta").trim()) return toast.error("Indica al menos el motivo de consulta.");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { cerrar, especialistaId: especialistaId ? Number(especialistaId) : undefined };
      for (const k of CAMPOS) payload[k] = g(k) || undefined;
      await api.post(`/consultas/${consulta.id}/pediatria`, payload);
      toast.success(cerrar ? "Historia pediátrica guardada y cerrada" : "Historia pediátrica guardada");
      router.push("/consultas/lista");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
      setSaving(false);
    }
  }

  async function reabrir() {
    try {
      await api.post(`/consultas/${consulta.id}/reabrir`, {});
      toast.success("Historia reabierta · ya puedes editarla");
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo reabrir");
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-2 text-sm text-muted-foreground">
        Consultas <span className="px-1">›</span>
        <button onClick={() => router.push("/consultas/lista")} className="hover:text-foreground">Lista</button>
        <span className="px-1">›</span>
        <span className="text-foreground">Historia pediátrica</span>
      </p>
      <PageHeader
        title="Historia clínica pediátrica"
        actions={
          <>
            {cerrada && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <Lock className="h-3.5 w-3.5" /> Cerrada
              </span>
            )}
            {consulta.estado === "Atendida" && (
              <Button variant="outline" onClick={() => window.open(`/comprobante-pediatria/${consulta.id}`, "_blank")}>
                <Printer className="h-4 w-4" /> Imprimir
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/consultas/lista")}>
              <ArrowLeft className="h-4 w-4" /> Volver
            </Button>
          </>
        }
      />

      {/* Filiación */}
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white" style={{ background: ACCENT }}>{initials(nombre)}</span>
            <div>
              <p className="font-heading text-base font-bold">{nombre}</p>
              <p className="text-sm text-muted-foreground">
                {p?.tipoDoc} {p?.numDoc}{edad != null && ` · ${edad} años`} · {p?.sexo} · {consulta.tipoNombre}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>{formatDateLong(consulta.fecha)}</div>
            {p?.telefono && <div>Cel. {p.telefono}</div>}
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4 min-w-0">
        <fieldset disabled={cerrada} className="m-0 space-y-4 border-0 p-0">

          {/* 1 · Identificación */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Baby className="h-4 w-4" style={{ color: ACCENT }} /> Datos de identificación</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-4">
              <Campo label="Informante"><Input value={g("informante")} onChange={(e) => set("informante", e.target.value)} placeholder="Madre / padre / cuidador" /></Campo>
              <Campo label="Nombre de la madre" span={2}><Input value={g("madreNombre")} onChange={(e) => set("madreNombre", e.target.value)} /></Campo>
              <Campo label="Nombre del padre" span={2}><Input value={g("padreNombre")} onChange={(e) => set("padreNombre", e.target.value)} /></Campo>
              <Campo label="Lugar de nacimiento"><Input value={g("lugarNacimiento")} onChange={(e) => set("lugarNacimiento", e.target.value)} /></Campo>
              <Campo label="Procedencia"><Input value={g("procedencia")} onChange={(e) => set("procedencia", e.target.value)} /></Campo>
              <Campo label="Condición / seguro">
                <Select value={g("seguro") || undefined} onValueChange={(val) => set("seguro", val)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>
                    {["SIS", "Estatal", "Particular", "EsSalud", "Sin seguro"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Campo>
              <Campo label="Ingreso por servicio de"><Input value={g("servicioIngreso")} onChange={(e) => set("servicioIngreso", e.target.value)} /></Campo>
            </CardContent>
          </Card>

          {/* 2 · Enfermedad actual */}
          <Card>
            <CardHeader><CardTitle>Enfermedad actual</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Campo label="Motivo de consulta"><Textarea value={g("motivoConsulta")} onChange={(e) => set("motivoConsulta", e.target.value)} rows={3} placeholder="Motivo por el que acude (puede ser texto amplio)" /></Campo>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <Campo label="Tiempo de enfermedad"><Input value={g("tiempoEnfermedad")} onChange={(e) => set("tiempoEnfermedad", e.target.value)} placeholder="Ej. 3 días" /></Campo>
                <Campo label="Forma de inicio"><Input value={g("formaInicio")} onChange={(e) => set("formaInicio", e.target.value)} placeholder="Brusco / insidioso" /></Campo>
              </div>
              <Campo label="Historia de la enfermedad actual (relato cronológico)"><Textarea value={g("relato")} onChange={(e) => set("relato", e.target.value)} rows={4} /></Campo>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <Campo label="Datos negativos importantes"><Textarea value={g("datosNegativos")} onChange={(e) => set("datosNegativos", e.target.value)} rows={2} /></Campo>
                <Campo label="Funciones biológicas"><Textarea value={g("funcionesBiologicas")} onChange={(e) => set("funcionesBiologicas", e.target.value)} rows={2} placeholder="Apetito, sed, orina, deposiciones, sueño" /></Campo>
              </div>
              <Campo label="Revisión de sistemas"><Textarea value={g("revisionSistemas")} onChange={(e) => set("revisionSistemas", e.target.value)} rows={2} placeholder="Ojos, ORL, cardiovascular, respiratorio, digestivo, genito-urinario, endocrino, hematológico, piel, neurológico…" /></Campo>
            </CardContent>
          </Card>

          {/* 3 · Antecedentes personales */}
          <Card>
            <CardHeader><CardTitle>Antecedentes personales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Campo label="Perinatales (embarazo, parto, reanimación, Apgar, lactancia, periodo neonatal)"><Textarea value={g("antPerinatales")} onChange={(e) => set("antPerinatales", e.target.value)} rows={3} /></Campo>
              <div className="grid grid-cols-3 gap-x-5 gap-y-4">
                <Campo label="Peso al nacer"><Input value={g("pesoNacer")} onChange={(e) => set("pesoNacer", e.target.value)} placeholder="3.2 kg" /></Campo>
                <Campo label="Talla al nacer"><Input value={g("tallaNacer")} onChange={(e) => set("tallaNacer", e.target.value)} placeholder="49 cm" /></Campo>
                <Campo label="Apgar"><Input value={g("apgar")} onChange={(e) => set("apgar", e.target.value)} placeholder="8 / 9" /></Campo>
              </div>
              <Campo label="Nutricionales (lactancia, biberón, fórmula, alimentación complementaria y actual)"><Textarea value={g("antNutricionales")} onChange={(e) => set("antNutricionales", e.target.value)} rows={2} /></Campo>
              <Campo label="Crecimiento y desarrollo (hitos psicomotores)"><Textarea value={g("desarrollo")} onChange={(e) => set("desarrollo", e.target.value)} rows={2} placeholder="Sostén cefálico, sedestación, gateo, marcha, lenguaje, control de esfínteres…" /></Campo>
              <Campo label="Escolaridad / rendimiento / conducta"><Input value={g("escolaridad")} onChange={(e) => set("escolaridad", e.target.value)} /></Campo>
              <Campo label="Inmunizaciones"><Textarea value={g("inmunizaciones")} onChange={(e) => set("inmunizaciones", e.target.value)} rows={2} placeholder="Esquema según edad: BCG, HvB, pentavalente, polio, rotavirus, neumococo, influenza, SPR…" /></Campo>
              <Campo label="Patológicos (hospitalizaciones, cirugías, alergias, transfusiones, etc.)"><Textarea value={g("antPatologicos")} onChange={(e) => set("antPatologicos", e.target.value)} rows={2} /></Campo>
            </CardContent>
          </Card>

          {/* 4 · Antecedentes familiares */}
          <Card>
            <CardHeader><CardTitle>Antecedentes familiares</CardTitle></CardHeader>
            <CardContent>
              <Campo label="Familiares"><Textarea value={g("antFamiliares")} onChange={(e) => set("antFamiliares", e.target.value)} rows={3} placeholder="Diabetes, HTA, asma, alergias, TBC, epilepsia, etc." /></Campo>
            </CardContent>
          </Card>

          {/* 7 · Examen físico */}
          <Card>
            <CardHeader><CardTitle>Examen físico · somatometría</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-5">
                <Campo label="Peso (kg)"><Input value={g("peso")} onChange={(e) => set("peso", e.target.value)} /></Campo>
                <Campo label="Talla (m)"><Input value={g("talla")} onChange={(e) => set("talla", e.target.value)} /></Campo>
                <Campo label="P. cefálico (cm)"><Input value={g("pc")} onChange={(e) => set("pc", e.target.value)} /></Campo>
                <Campo label="P. abdominal (cm)"><Input value={g("perimetroAbdominal")} onChange={(e) => set("perimetroAbdominal", e.target.value)} /></Campo>
                <Campo label="IMC"><Input value={g("imc")} onChange={(e) => set("imc", e.target.value)} /></Campo>
                <Campo label="FC (/min)"><Input value={g("fc")} onChange={(e) => set("fc", e.target.value)} /></Campo>
                <Campo label="FR (/min)"><Input value={g("fr")} onChange={(e) => set("fr", e.target.value)} /></Campo>
                <Campo label="T/A (mmHg)"><Input value={g("ta")} onChange={(e) => set("ta", e.target.value)} /></Campo>
                <Campo label="T° (°C)"><Input value={g("temperatura")} onChange={(e) => set("temperatura", e.target.value)} /></Campo>
                <Campo label="Percentiles"><Input value={g("percentiles")} onChange={(e) => set("percentiles", e.target.value)} placeholder="P. peso / P. talla" /></Campo>
              </div>
              <Campo label="Inspección general (impresión visual: estado general, aspecto, facies, hidratación, conciencia…)"><Textarea value={g("inspeccionGeneral")} onChange={(e) => set("inspeccionGeneral", e.target.value)} rows={3} /></Campo>
            </CardContent>
          </Card>

          {/* 10 · Hipótesis diagnóstica */}
          <Card>
            <CardHeader><CardTitle>Hipótesis diagnóstica</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <Campo label="De la patología (enumerar)"><Textarea value={g("dxPatologia")} onChange={(e) => set("dxPatologia", e.target.value)} rows={3} placeholder="1.&#10;2.&#10;3." /></Campo>
              <Campo label="Crecimiento, desarrollo y estado de nutrición"><Textarea value={g("dxCrecimiento")} onChange={(e) => set("dxCrecimiento", e.target.value)} rows={3} placeholder="1.&#10;2." /></Campo>
            </CardContent>
          </Card>

          {/* 11-12 · Planes + profesional */}
          <Card>
            <CardHeader><CardTitle>Plan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Campo label="Plan de estudio / comprobación del diagnóstico"><Textarea value={g("planEstudio")} onChange={(e) => set("planEstudio", e.target.value)} rows={2} /></Campo>
              <Campo label="Plan de manejo inicial (priorizar)"><Textarea value={g("planManejo")} onChange={(e) => set("planManejo", e.target.value)} rows={3} /></Campo>
              <Campo label="Médico que elaboró la historia">
                <Select value={especialistaId || undefined} onValueChange={setEspecialistaId}>
                  <SelectTrigger className="w-full sm:w-96"><SelectValue placeholder="Selecciona profesional…" /></SelectTrigger>
                  <SelectContent>
                    {profesionales.data.map((x) => (
                      <SelectItem key={x.id} value={String(x.id)}>{String(x.nombres)} {String(x.apellidos)}{x.especialidad ? ` · ${String(x.especialidad)}` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
              {esp && (
                <p className="text-xs text-muted-foreground">
                  Colegio: {v(esp.cmp) || "—"} · Consultorio: {v(esp.consultorio) || "—"} · Turno: {v(esp.turno) || "—"} · Código: {v(esp.codigoSalud) || "—"}
                </p>
              )}
            </CardContent>
          </Card>

        </fieldset>
        <div className="pb-6">
          <AccionesCierre cerrada={cerrada} fechaCierre={pd?.fechaCierre} saving={saving} onGuardar={guardar} onReabrir={reabrir} onCancel={() => router.push("/consultas/lista")} />
        </div>
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start">
          <HistorialClinicoPanel pacienteId={consulta.pacienteId} excludeConsultaId={consulta.id} />
        </div>
      </div>
    </div>
  );
}
