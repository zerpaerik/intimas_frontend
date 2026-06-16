"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Baby, Flag, Loader2, Printer, Save, Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { calcAge, formatDate, formatDateLong, initials } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiItem, useApiList } from "@/lib/api/hooks";
import { type Carne, type Consulta } from "@/lib/api/consultas";
import type { Row } from "@/lib/resources/types";
import { HistoriaForm } from "./historia-form";
import { HistorialClinicoPanel } from "./historial-clinico-panel";

const s = (x: unknown) => (x == null ? "" : String(x));
const d10 = (x: unknown) => (x ? String(x).slice(0, 10) : "");

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function semanasFUM(iso?: string) {
  if (!iso) return null;
  const diff = Date.now() - new Date(`${iso}T12:00:00`).getTime();
  return diff > 0 ? Math.floor(diff / (7 * 86400000)) : 0;
}

function Campo({ label, span, children }: { label: string; span?: 1 | 2; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", span === 2 && "sm:col-span-2")}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ControlForm({ consulta }: { consulta: Consulta }) {
  const router = useRouter();
  const profesionales = useApiList<Row>("/profesionales");
  const { data: carne, loading: carneLoading } = useApiItem<Carne>(`/consultas/carne/${consulta.pacienteId}`);
  const cc = consulta.control;

  const [gest, setGest] = React.useState<Record<string, string>>({});
  const [ctrl, setCtrl] = React.useState<Record<string, string>>({
    semanaGestacional: s(cc?.semanaGestacional), peso: s(cc?.peso), temperatura: s(cc?.temperatura), presionArterial: s(cc?.presionArterial),
    pulso: s(cc?.pulso), alturaUterina: s(cc?.alturaUterina), presentacion: s(cc?.presentacion), fcf: s(cc?.fcf),
    movimientosFetales: s(cc?.movimientosFetales), edema: s(cc?.edema), consejeria: s(cc?.consejeria), sulfatoFerroso: s(cc?.sulfatoFerroso),
    perfilBiofisico: s(cc?.perfilBiofisico), serologia: s(cc?.serologia), glucosa: s(cc?.glucosa), vih: s(cc?.vih), hemoglobina: s(cc?.hemoglobina),
    examenFisico: s(cc?.examenFisico), diagnostico: s(cc?.diagnostico), diagDefinitivo: s(cc?.diagDefinitivo), exAux: s(cc?.exAux),
    plan: s(cc?.plan), proximaCita: s(cc?.proximaCita), observaciones: s(cc?.observaciones),
  });
  const [especialistaId, setEspecialistaId] = React.useState(s(consulta.especialistaId));
  const [saving, setSaving] = React.useState(false);
  const gestLoaded = React.useRef(false);

  React.useEffect(() => {
    const gx = carne?.gestacion;
    if (gx && !gestLoaded.current) {
      gestLoaded.current = true;
      setGest({
        gestas: s(gx.gestas), partos: s(gx.partos), abortos: s(gx.abortos), cesareas: s(gx.cesareas), vaginales: s(gx.vaginales),
        nacidosVivos: s(gx.nacidosVivos), viven: s(gx.viven), nacidosMuertos: s(gx.nacidosMuertos),
        fum: d10(gx.fum), fpp: d10(gx.fpp), ecoeg: s(gx.ecoeg), tipoSangre: s(gx.tipoSangre), factorRh: s(gx.factorRh),
        orina: s(gx.orina), urea: s(gx.urea), creatinina: s(gx.creatinina), bk: s(gx.bk), torch: s(gx.torch),
      });
    }
  }, [carne]);

  const g = (k: string) => ctrl[k] ?? "";
  const set = (k: string, val: string) => setCtrl((f) => ({ ...f, [k]: val }));
  const ga = (k: string) => gest[k] ?? "";
  const sa = (k: string, val: string) => setGest((f) => ({ ...f, [k]: val }));
  const setFum = (val: string) => setGest((f) => ({ ...f, fum: val, fpp: val ? addDays(val, 280) : "" }));

  const nombre = `${consulta.paciente?.nombres ?? ""} ${consulta.paciente?.apellidos ?? ""}`.trim();
  const edad = consulta.paciente?.fechaNacimiento ? calcAge(String(consulta.paciente.fechaNacimiento)) : null;
  const sem = semanasFUM(ga("fum"));
  const controles = carne?.controles ?? [];
  const gestId = carne?.gestacion?.id;

  function intOrU(x: string) { return x ? Number(x) : undefined; }

  async function guardar() {
    setSaving(true);
    try {
      await api.post(`/consultas/${consulta.id}/control`, {
        gestacion: {
          gestas: intOrU(ga("gestas")), partos: intOrU(ga("partos")), abortos: intOrU(ga("abortos")), cesareas: intOrU(ga("cesareas")),
          vaginales: intOrU(ga("vaginales")), nacidosVivos: intOrU(ga("nacidosVivos")), viven: intOrU(ga("viven")), nacidosMuertos: intOrU(ga("nacidosMuertos")),
          fum: ga("fum") || undefined, fpp: ga("fpp") || undefined, ecoeg: ga("ecoeg") || undefined, tipoSangre: ga("tipoSangre") || undefined, factorRh: ga("factorRh") || undefined,
          orina: ga("orina") || undefined, urea: ga("urea") || undefined, creatinina: ga("creatinina") || undefined, bk: ga("bk") || undefined, torch: ga("torch") || undefined,
        },
        semanaGestacional: intOrU(g("semanaGestacional")),
        peso: g("peso") || undefined, temperatura: g("temperatura") || undefined, presionArterial: g("presionArterial") || undefined, pulso: g("pulso") || undefined,
        alturaUterina: g("alturaUterina") || undefined, presentacion: g("presentacion") || undefined, fcf: g("fcf") || undefined,
        movimientosFetales: g("movimientosFetales") || undefined, edema: g("edema") || undefined, consejeria: g("consejeria") || undefined,
        sulfatoFerroso: g("sulfatoFerroso") || undefined, perfilBiofisico: g("perfilBiofisico") || undefined,
        serologia: g("serologia") || undefined, glucosa: g("glucosa") || undefined, vih: g("vih") || undefined, hemoglobina: g("hemoglobina") || undefined,
        examenFisico: g("examenFisico") || undefined, diagnostico: g("diagnostico") || undefined, diagDefinitivo: g("diagDefinitivo") || undefined,
        exAux: g("exAux") || undefined, plan: g("plan") || undefined, proximaCita: g("proximaCita") || undefined, observaciones: g("observaciones") || undefined,
        especialistaId: especialistaId ? Number(especialistaId) : undefined,
      });
      toast.success("Control prenatal guardado");
      router.push("/consultas/lista");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
      setSaving(false);
    }
  }

  async function terminar() {
    if (!gestId) return toast.error("Primero guarda al menos un control de esta gestación.");
    const motivo = window.prompt("Terminar los controles de esta gestación. Motivo (parto, aborto, etc.):", "Parto");
    if (motivo === null) return;
    try {
      await api.post(`/consultas/gestacion/${gestId}/cerrar`, { motivo });
      toast.success("Controles finalizados. La próxima vez se abrirá un carné nuevo.");
      router.push("/consultas/lista");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo finalizar");
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-2 text-sm text-muted-foreground">
        Consultas <span className="px-1">›</span>
        <button onClick={() => router.push("/consultas/lista")} className="hover:text-foreground">Lista</button>
        <span className="px-1">›</span>
        <span className="text-foreground">Control prenatal</span>
      </p>
      <PageHeader
        title="Control prenatal · carné"
        actions={
          <>
            {gestId && <Button variant="outline" className="text-destructive hover:text-destructive" onClick={terminar}><Flag className="h-4 w-4" /> Terminar controles</Button>}
            {consulta.estado === "Atendida" && <Button variant="outline" onClick={() => window.open(`/comprobante-control/${consulta.id}`, "_blank")}><Printer className="h-4 w-4" /> Imprimir</Button>}
            <Button variant="outline" onClick={() => router.push("/consultas/lista")}><ArrowLeft className="h-4 w-4" /> Volver</Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white" style={{ background: "#993556" }}>{initials(nombre)}</span>
            <div>
              <p className="font-heading text-base font-bold">{nombre}</p>
              <p className="text-sm text-muted-foreground">{consulta.paciente?.numDoc}{edad != null && ` · ${edad} años`} · {consulta.tipoNombre}</p>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>{formatDateLong(consulta.fecha)}</div>
            {sem != null && <div className="font-medium text-brand">{sem} semanas</div>}
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
        {/* Antecedentes obstétricos (gestación) */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Baby className="h-4 w-4 text-brand" /> Antecedentes obstétricos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 lg:grid-cols-8">
              <Campo label="Gestas"><Input type="number" value={ga("gestas")} onChange={(e) => sa("gestas", e.target.value)} /></Campo>
              <Campo label="Partos"><Input type="number" value={ga("partos")} onChange={(e) => sa("partos", e.target.value)} /></Campo>
              <Campo label="Abortos"><Input type="number" value={ga("abortos")} onChange={(e) => sa("abortos", e.target.value)} /></Campo>
              <Campo label="Cesáreas"><Input type="number" value={ga("cesareas")} onChange={(e) => sa("cesareas", e.target.value)} /></Campo>
              <Campo label="Vaginales"><Input type="number" value={ga("vaginales")} onChange={(e) => sa("vaginales", e.target.value)} /></Campo>
              <Campo label="Nac. vivos"><Input type="number" value={ga("nacidosVivos")} onChange={(e) => sa("nacidosVivos", e.target.value)} /></Campo>
              <Campo label="Viven"><Input type="number" value={ga("viven")} onChange={(e) => sa("viven", e.target.value)} /></Campo>
              <Campo label="Nac. muertos"><Input type="number" value={ga("nacidosMuertos")} onChange={(e) => sa("nacidosMuertos", e.target.value)} /></Campo>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-5">
              <Campo label="Tipo de sangre"><Input value={ga("tipoSangre")} onChange={(e) => sa("tipoSangre", e.target.value)} placeholder="O" /></Campo>
              <Campo label="Factor RH"><Input value={ga("factorRh")} onChange={(e) => sa("factorRh", e.target.value)} placeholder="RH +" /></Campo>
              <Campo label="FUM"><Input type="date" value={ga("fum")} onChange={(e) => setFum(e.target.value)} /></Campo>
              <Campo label="FPP (auto)"><Input type="date" value={ga("fpp")} onChange={(e) => sa("fpp", e.target.value)} /></Campo>
              <Campo label="ECO EG"><Input value={ga("ecoeg")} onChange={(e) => sa("ecoeg", e.target.value)} placeholder="12 sem" /></Campo>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exámenes de base</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-5">
                <Campo label="Orina"><Input value={ga("orina")} onChange={(e) => sa("orina", e.target.value)} /></Campo>
                <Campo label="Urea"><Input value={ga("urea")} onChange={(e) => sa("urea", e.target.value)} /></Campo>
                <Campo label="Creatinina"><Input value={ga("creatinina")} onChange={(e) => sa("creatinina", e.target.value)} /></Campo>
                <Campo label="BK"><Input value={ga("bk")} onChange={(e) => sa("bk", e.target.value)} /></Campo>
                <Campo label="TORCH"><Input value={ga("torch")} onChange={(e) => sa("torch", e.target.value)} /></Campo>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles del embarazo */}
        {controles.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Controles del embarazo</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Fecha</TableHead><TableHead className="text-xs">Sem</TableHead><TableHead className="text-xs">Peso</TableHead>
                    <TableHead className="text-xs">P/A</TableHead><TableHead className="text-xs">AU</TableHead><TableHead className="text-xs">FCF</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Mov</TableHead><TableHead className="text-xs hidden sm:table-cell">Edema</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {controles.map((x) => (
                    <TableRow key={x.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(x.fecha)}</TableCell>
                      <TableCell>{x.semanaGestacional ?? "—"}</TableCell><TableCell>{x.peso || "—"}</TableCell>
                      <TableCell>{x.presionArterial || "—"}</TableCell><TableCell>{x.alturaUterina || "—"}</TableCell><TableCell>{x.fcf || "—"}</TableCell>
                      <TableCell className="hidden sm:table-cell">{x.movimientosFetales || "—"}</TableCell><TableCell className="hidden sm:table-cell">{x.edema || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Nuevo control */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-brand" /> Nuevo control · esta visita</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-5">
              <Campo label="Semana"><Input type="number" value={g("semanaGestacional")} onChange={(e) => set("semanaGestacional", e.target.value)} placeholder={sem != null ? String(sem) : ""} /></Campo>
              <Campo label="Peso (kg)"><Input value={g("peso")} onChange={(e) => set("peso", e.target.value)} /></Campo>
              <Campo label="T° (°C)"><Input value={g("temperatura")} onChange={(e) => set("temperatura", e.target.value)} /></Campo>
              <Campo label="P/A"><Input value={g("presionArterial")} onChange={(e) => set("presionArterial", e.target.value)} placeholder="110/70" /></Campo>
              <Campo label="Pulso"><Input value={g("pulso")} onChange={(e) => set("pulso", e.target.value)} /></Campo>
              <Campo label="Altura uterina"><Input value={g("alturaUterina")} onChange={(e) => set("alturaUterina", e.target.value)} /></Campo>
              <Campo label="Presentación"><Input value={g("presentacion")} onChange={(e) => set("presentacion", e.target.value)} placeholder="Cefálico" /></Campo>
              <Campo label="FCF"><Input value={g("fcf")} onChange={(e) => set("fcf", e.target.value)} /></Campo>
              <Campo label="Mov. fetal"><Input value={g("movimientosFetales")} onChange={(e) => set("movimientosFetales", e.target.value)} placeholder="Presentes" /></Campo>
              <Campo label="Edema"><Input value={g("edema")} onChange={(e) => set("edema", e.target.value)} placeholder="No" /></Campo>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              <Campo label="Consejería PF"><Input value={g("consejeria")} onChange={(e) => set("consejeria", e.target.value)} /></Campo>
              <Campo label="Sulfato ferroso"><Input value={g("sulfatoFerroso")} onChange={(e) => set("sulfatoFerroso", e.target.value)} /></Campo>
              <Campo label="Perfil biofísico"><Input value={g("perfilBiofisico")} onChange={(e) => set("perfilBiofisico", e.target.value)} /></Campo>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Laboratorio de la visita</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                <Campo label="Serología"><Input value={g("serologia")} onChange={(e) => set("serologia", e.target.value)} /></Campo>
                <Campo label="Glucosa"><Input value={g("glucosa")} onChange={(e) => set("glucosa", e.target.value)} /></Campo>
                <Campo label="VIH"><Input value={g("vih")} onChange={(e) => set("vih", e.target.value)} /></Campo>
                <Campo label="Hemoglobina"><Input value={g("hemoglobina")} onChange={(e) => set("hemoglobina", e.target.value)} /></Campo>
              </div>
            </div>
            <Campo label="Examen físico" span={2}><Textarea value={g("examenFisico")} onChange={(e) => set("examenFisico", e.target.value)} rows={2} /></Campo>
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <Campo label="Diagnóstico"><Input value={g("diagnostico")} onChange={(e) => set("diagnostico", e.target.value)} /></Campo>
              <Campo label="Diagnóstico definitivo"><Input value={g("diagDefinitivo")} onChange={(e) => set("diagDefinitivo", e.target.value)} /></Campo>
              <Campo label="Exámenes auxiliares"><Input value={g("exAux")} onChange={(e) => set("exAux", e.target.value)} /></Campo>
              <Campo label="Próxima cita"><Input value={g("proximaCita")} onChange={(e) => set("proximaCita", e.target.value)} placeholder="En 4 semanas" /></Campo>
            </div>
            <Campo label="Plan / tratamiento" span={2}><Textarea value={g("plan")} onChange={(e) => set("plan", e.target.value)} rows={2} /></Campo>
            <Campo label="Profesional" span={2}>
              <Select value={especialistaId || undefined} onValueChange={setEspecialistaId}>
                <SelectTrigger className="w-full sm:w-96"><SelectValue placeholder="Asignar profesional…" /></SelectTrigger>
                <SelectContent>
                  {profesionales.data.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{String(p.nombres)} {String(p.apellidos)}{p.especialidad ? ` · ${String(p.especialidad)}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
            <Campo label="Observaciones" span={2}><Textarea value={g("observaciones")} onChange={(e) => set("observaciones", e.target.value)} rows={2} /></Campo>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.push("/consultas/lista")}>Cancelar</Button>
              <Button className="bg-brand-gradient text-white" onClick={guardar} disabled={saving || carneLoading}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar control
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start">
          <HistorialClinicoPanel pacienteId={consulta.pacienteId} excludeConsultaId={consulta.id} />
        </div>
      </div>
    </div>
  );
}

export function AtenderConsulta({ id }: { id: number }) {
  const router = useRouter();
  const { data: consulta, loading } = useApiItem<Consulta>(id ? `/consultas/${id}` : null);

  if (loading) return <div className="mx-auto max-w-4xl"><Skeleton className="h-[32rem] w-full rounded-2xl" /></div>;
  if (!consulta) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-dashed py-20 text-center text-muted-foreground">
        No se encontró la consulta.
        <div className="mt-4"><Button variant="outline" onClick={() => router.push("/consultas/lista")}>Volver</Button></div>
      </div>
    );
  }
  return consulta.prenatal ? <ControlForm consulta={consulta} /> : <HistoriaForm consulta={consulta} />;
}
