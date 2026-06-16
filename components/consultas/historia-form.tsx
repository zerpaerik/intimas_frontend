"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Printer, Save, Trash2 } from "lucide-react";
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
import { esGineco, type Consulta } from "@/lib/api/consultas";
import type { Row } from "@/lib/resources/types";
import { Cie10Search } from "./cie10-search";

const v = (x: unknown) => (x == null ? "" : String(x));

function Campo({ label, span, children }: { label: string; span?: 1 | 2 | 3; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", span === 2 && "sm:col-span-2", span === 3 && "sm:col-span-3")}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

interface DiagRow { cie10: string; descripcion: string }
interface TratRow { medicamento: string; presentacion: string; cantidad: string; dosis: string; dias: string }

export function HistoriaForm({ consulta }: { consulta: Consulta }) {
  const router = useRouter();
  const gineco = esGineco(consulta);
  const profesionales = useApiList<Row>("/profesionales");
  const h = consulta.historia;
  const p = consulta.paciente;

  const [form, setForm] = React.useState<Record<string, string>>({
    enfInicio: v(h?.enfInicio), enfCurso: v(h?.enfCurso), enfRelato: v(h?.enfRelato),
    peso: v(h?.peso), fc: v(h?.fc), fr: v(h?.fr), presionArterial: v(h?.presionArterial), talla: v(h?.talla), temperatura: v(h?.temperatura),
    examenGeneral: v(h?.examenGeneral), procedimientos: v(h?.procedimientos), observaciones: v(h?.observaciones),
    antPersonales: v(p?.antPersonales), antFamiliares: v(p?.antFamiliares), antEpidemiologicos: v(p?.antEpidemiologicos),
    antQuirurgicos: v(p?.antQuirurgicos), antOtros: v(p?.antOtros),
    familiarNombre: v(p?.familiarNombre), familiarParentesco: v(p?.familiarParentesco), familiarDni: v(p?.familiarDni),
    facebook: v(p?.facebook),
  });
  const [diags, setDiags] = React.useState<DiagRow[]>(
    h?.diagnosticos?.length ? h.diagnosticos.map((d) => ({ cie10: d.cie10, descripcion: v(d.descripcion) })) : [{ cie10: "", descripcion: "" }],
  );
  const [trats, setTrats] = React.useState<TratRow[]>(
    h?.tratamientos?.length
      ? h.tratamientos.map((t) => ({ medicamento: t.medicamento, presentacion: v(t.presentacion), cantidad: v(t.cantidad), dosis: v(t.dosis), dias: v(t.dias) }))
      : [{ medicamento: "", presentacion: "", cantidad: "", dosis: "", dias: "" }],
  );
  const [especialistaId, setEspecialistaId] = React.useState(v(consulta.especialistaId));
  const [saving, setSaving] = React.useState(false);

  const g = (k: string) => form[k] ?? "";
  const set = (k: string, val: string) => setForm((f) => ({ ...f, [k]: val }));

  const nombre = `${p?.nombres ?? ""} ${p?.apellidos ?? ""}`.trim();
  const edad = p?.fechaNacimiento ? calcAge(String(p.fechaNacimiento)) : null;
  const esp = profesionales.data.find((x) => String(x.id) === especialistaId);

  async function guardar() {
    const dx = diags.filter((d) => d.cie10.trim());
    if (dx.length === 0) return toast.error("Agrega al menos un diagnóstico con CIE-10.");
    setSaving(true);
    try {
      await api.post(`/consultas/${consulta.id}/historia`, {
        enfInicio: g("enfInicio") || undefined, enfCurso: g("enfCurso") || undefined, enfRelato: g("enfRelato") || undefined,
        peso: g("peso") || undefined, fc: g("fc") || undefined, fr: g("fr") || undefined,
        presionArterial: g("presionArterial") || undefined, talla: g("talla") || undefined, temperatura: g("temperatura") || undefined,
        examenGeneral: g("examenGeneral") || undefined, procedimientos: g("procedimientos") || undefined, observaciones: g("observaciones") || undefined,
        antPersonales: g("antPersonales"), antFamiliares: g("antFamiliares"), antEpidemiologicos: g("antEpidemiologicos"),
        antQuirurgicos: g("antQuirurgicos"), antOtros: g("antOtros"),
        familiarNombre: g("familiarNombre"), familiarParentesco: g("familiarParentesco"), familiarDni: g("familiarDni"),
        facebook: g("facebook"),
        diagnosticos: dx,
        tratamientos: trats.filter((t) => t.medicamento.trim()),
        especialistaId: especialistaId ? Number(especialistaId) : undefined,
      });
      toast.success("Historia clínica guardada");
      router.push(`/comprobante-historia/${consulta.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <p className="mb-2 text-sm text-muted-foreground">
        Consultas <span className="px-1">›</span>
        <button onClick={() => router.push("/consultas/lista")} className="hover:text-foreground">Lista</button>
        <span className="px-1">›</span>
        <span className="text-foreground">Historia clínica</span>
      </p>
      <PageHeader
        title="Historia clínica"
        actions={
          <>
            {consulta.estado === "Atendida" && (
              <Button variant="outline" onClick={() => window.open(`/comprobante-historia/${consulta.id}`, "_blank")}>
                <Printer className="h-4 w-4" /> Imprimir
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/consultas/lista")}>
              <ArrowLeft className="h-4 w-4" /> Volver
            </Button>
          </>
        }
      />

      {/* 1 · Filiación */}
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white" style={{ background: gineco ? "#d4537e" : "var(--brand, #0091d5)" }}>{initials(nombre)}</span>
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

      <div className="space-y-4">
        {/* Familiar + Facebook */}
        <Card>
          <CardHeader><CardTitle>Familiar / contacto</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-4">
            <Campo label="Nombres y apellidos" span={2}><Input value={g("familiarNombre")} onChange={(e) => set("familiarNombre", e.target.value)} /></Campo>
            <Campo label="Parentesco"><Input value={g("familiarParentesco")} onChange={(e) => set("familiarParentesco", e.target.value)} /></Campo>
            <Campo label="DNI"><Input value={g("familiarDni")} onChange={(e) => set("familiarDni", e.target.value)} /></Campo>
            {gineco && <Campo label="Facebook" span={2}><Input value={g("facebook")} onChange={(e) => set("facebook", e.target.value)} /></Campo>}
          </CardContent>
        </Card>

        {/* 2 · Enfermedad actual */}
        <Card>
          <CardHeader><CardTitle>Enfermedad actual</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <Campo label="Inicio"><Input value={g("enfInicio")} onChange={(e) => set("enfInicio", e.target.value)} /></Campo>
              <Campo label="Curso"><Input value={g("enfCurso")} onChange={(e) => set("enfCurso", e.target.value)} /></Campo>
            </div>
            <Campo label="Relato"><Textarea value={g("enfRelato")} onChange={(e) => set("enfRelato", e.target.value)} rows={3} /></Campo>
          </CardContent>
        </Card>

        {/* 3 · Antecedentes (precargados del paciente) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Antecedentes
              <span className="rounded-full bg-info/10 px-2 py-0.5 text-[11px] font-medium text-info" style={{ color: "#185FA5", background: "#E6F1FB" }}>precargados · editables</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Campo label="Personales"><Textarea value={g("antPersonales")} onChange={(e) => set("antPersonales", e.target.value)} rows={2} /></Campo>
            <Campo label="Familiares"><Textarea value={g("antFamiliares")} onChange={(e) => set("antFamiliares", e.target.value)} rows={2} /></Campo>
            <Campo label="Epidemiológicos"><Textarea value={g("antEpidemiologicos")} onChange={(e) => set("antEpidemiologicos", e.target.value)} rows={2} /></Campo>
            <Campo label="Quirúrgicos"><Textarea value={g("antQuirurgicos")} onChange={(e) => set("antQuirurgicos", e.target.value)} rows={2} /></Campo>
            <Campo label="Otros"><Textarea value={g("antOtros")} onChange={(e) => set("antOtros", e.target.value)} rows={2} /></Campo>
          </CardContent>
        </Card>

        {/* 4 · Examen clínico */}
        <Card>
          <CardHeader><CardTitle>Examen clínico · funciones vitales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-6">
              <Campo label="Peso (kg)"><Input value={g("peso")} onChange={(e) => set("peso", e.target.value)} /></Campo>
              <Campo label="FC"><Input value={g("fc")} onChange={(e) => set("fc", e.target.value)} /></Campo>
              <Campo label="FR"><Input value={g("fr")} onChange={(e) => set("fr", e.target.value)} /></Campo>
              <Campo label="P/A"><Input value={g("presionArterial")} onChange={(e) => set("presionArterial", e.target.value)} /></Campo>
              <Campo label="Talla (m)"><Input value={g("talla")} onChange={(e) => set("talla", e.target.value)} /></Campo>
              <Campo label="T° (°C)"><Input value={g("temperatura")} onChange={(e) => set("temperatura", e.target.value)} /></Campo>
            </div>
            <Campo label="Examen general"><Textarea value={g("examenGeneral")} onChange={(e) => set("examenGeneral", e.target.value)} rows={2} /></Campo>
          </CardContent>
        </Card>

        {/* 5 · Impresión diagnóstica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Impresión diagnóstica <span className="text-xs text-destructive">CIE-10 obligatorio</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diags.map((d, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-2">
                <Cie10Search
                  value={d.cie10}
                  onSelect={(codigo, descripcion) => setDiags((prev) => prev.map((x, j) => (j === i ? { cie10: codigo, descripcion: x.descripcion || descripcion } : x)))}
                />
                <Input value={d.descripcion} onChange={(e) => setDiags((prev) => prev.map((x, j) => (j === i ? { ...x, descripcion: e.target.value } : x)))} placeholder="Descripción del diagnóstico" className="h-9" />
                <button onClick={() => setDiags((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev))} disabled={diags.length <= 1} className="text-muted-foreground hover:text-destructive disabled:opacity-30" aria-label="Quitar"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setDiags((prev) => [...prev, { cie10: "", descripcion: "" }])}><Plus className="h-4 w-4" /> Agregar diagnóstico</Button>
          </CardContent>
        </Card>

        {/* 6 · Procedimientos */}
        <Card>
          <CardHeader><CardTitle>Procedimientos · exámenes auxiliares · intervenciones</CardTitle></CardHeader>
          <CardContent><Textarea value={g("procedimientos")} onChange={(e) => set("procedimientos", e.target.value)} rows={2} /></CardContent>
        </Card>

        {/* 7 · Tratamiento */}
        <Card>
          <CardHeader><CardTitle>Tratamiento</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="hidden grid-cols-[2fr_1.2fr_0.7fr_0.9fr_0.7fr_auto] gap-2 px-1 text-xs text-muted-foreground sm:grid">
              <span>Medicamento</span><span>Presentación</span><span>Cant.</span><span>Dosis</span><span>Días</span><span />
            </div>
            {trats.map((t, i) => (
              <div key={i} className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[2fr_1.2fr_0.7fr_0.9fr_0.7fr_auto]">
                <Input value={t.medicamento} onChange={(e) => setTrats((prev) => prev.map((x, j) => (j === i ? { ...x, medicamento: e.target.value } : x)))} placeholder="Medicamento" className="h-9" />
                <Input value={t.presentacion} onChange={(e) => setTrats((prev) => prev.map((x, j) => (j === i ? { ...x, presentacion: e.target.value } : x)))} placeholder="Presentación" className="h-9" />
                <Input value={t.cantidad} onChange={(e) => setTrats((prev) => prev.map((x, j) => (j === i ? { ...x, cantidad: e.target.value } : x)))} placeholder="Cant." className="h-9" />
                <Input value={t.dosis} onChange={(e) => setTrats((prev) => prev.map((x, j) => (j === i ? { ...x, dosis: e.target.value } : x)))} placeholder="Dosis" className="h-9" />
                <Input value={t.dias} onChange={(e) => setTrats((prev) => prev.map((x, j) => (j === i ? { ...x, dias: e.target.value } : x)))} placeholder="Días" className="h-9" />
                <button onClick={() => setTrats((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev))} disabled={trats.length <= 1} className="text-muted-foreground hover:text-destructive disabled:opacity-30" aria-label="Quitar"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setTrats((prev) => [...prev, { medicamento: "", presentacion: "", cantidad: "", dosis: "", dias: "" }])}><Plus className="h-4 w-4" /> Agregar medicamento</Button>
          </CardContent>
        </Card>

        {/* 8 · Observaciones + profesional */}
        <Card>
          <CardHeader><CardTitle>Observaciones</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Campo label="Referencia, próxima cita, interconsulta, otros"><Textarea value={g("observaciones")} onChange={(e) => set("observaciones", e.target.value)} rows={2} /></Campo>
            <Campo label="Profesional que atiende">
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

        <div className="flex justify-end gap-2 pb-6">
          <Button variant="outline" onClick={() => router.push("/consultas/lista")}>Cancelar</Button>
          <Button className="bg-brand-gradient text-white" onClick={guardar} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar historia
          </Button>
        </div>
      </div>
    </div>
  );
}
