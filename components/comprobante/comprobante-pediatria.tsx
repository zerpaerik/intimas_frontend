"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calcAge, formatDateLong } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { type Consulta } from "@/lib/api/consultas";

const ACCENT = "#0c447c";

function Sec({ n, title, children }: { n?: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ background: ACCENT, color: "#fff", fontSize: 12, fontWeight: 500, padding: "3px 8px", borderRadius: 3 }}>
        {n != null ? `${n}. ` : ""}{title}
      </div>
      <div style={{ border: "1px solid #d3dae3", borderTop: "none", padding: 10 }}>{children}</div>
    </div>
  );
}
function Field({ label, value, w }: { label: string; value?: string | null; w?: string }) {
  return (
    <div style={{ flex: w ? `0 0 ${w}` : "1", minWidth: 0 }}>
      <div style={{ fontSize: 10, color: "#7c8794", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13, minHeight: 18, whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>{value || "—"}</div>
    </div>
  );
}
function Bloque({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 10, color: "#7c8794", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13, minHeight: 18, whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>{value || "—"}</div>
    </div>
  );
}

export function ComprobantePediatria({ id }: { id: number }) {
  const { data: c, loading } = useApiItem<Consulta>(id ? `/consultas/${id}` : null);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando historia…</div>;
  }
  if (!c || !c.pediatrica) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        Esta consulta aún no tiene historia pediátrica registrada.
        <Button variant="outline" onClick={() => window.close()}>Cerrar</Button>
      </div>
    );
  }

  const h = c.pediatrica;
  const p = c.paciente;
  const e = c.especialista;
  const nombre = `${p?.nombres ?? ""} ${p?.apellidos ?? ""}`.trim();
  const edad = p?.fechaNacimiento ? calcAge(String(p.fechaNacimiento)) : null;

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0" style={{ color: "#23282e", overflowWrap: "anywhere", wordBreak: "break-word" }}>
      <div className="no-print mx-auto mb-4 flex max-w-[820px] items-center justify-between px-4">
        <Button variant="outline" onClick={() => window.close()}><X className="h-4 w-4" /> Cerrar</Button>
        <Button className="bg-brand-gradient text-white" onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimir / Guardar PDF</Button>
      </div>

      <div className="mx-auto max-w-[820px] bg-white px-4 print:max-w-none print:px-0">
        <div style={{ padding: 24 }} className="print:p-2">
          {/* Encabezado */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: `2px solid ${ACCENT}`, paddingBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Image src="/brand/intimas-logo.png" alt="Intimas" width={120} height={52} style={{ height: 46, width: "auto", objectFit: "contain" }} />
              <div style={{ fontSize: 11, color: "#6b727b" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#23282e" }}>Consultorios Médicos Intimas</div>
                <div>Pediatría · Crecimiento y desarrollo</div>
                <div>RUC 20601234567</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: ACCENT }}>Historia clínica pediátrica</div>
              <div style={{ fontSize: 12, color: "#7c8794" }}>N° {String(c.id).padStart(6, "0")} · {formatDateLong(c.fecha)}</div>
            </div>
          </div>

          {/* 1 Datos de identificación */}
          <Sec n={1} title="Datos de identificación del paciente">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Field label="Paciente" value={nombre} w="38%" />
              <Field label="Documento" value={`${p?.tipoDoc ?? ""} ${p?.numDoc ?? ""}`.trim()} />
              <Field label="Sexo" value={p?.sexo} />
              <Field label="Edad" value={edad != null ? `${edad} años` : ""} />
              <Field label="Fec. atención" value={formatDateLong(c.fecha)} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              <Field label="Informante" value={h.informante} />
              <Field label="Nombre de la madre" value={h.madreNombre} w="30%" />
              <Field label="Nombre del padre" value={h.padreNombre} w="30%" />
              <Field label="N° celular" value={p?.telefono} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8, borderTop: "1px dashed #e1e6ec", paddingTop: 8 }}>
              <Field label="Lugar de nacimiento" value={h.lugarNacimiento} />
              <Field label="Procedencia" value={h.procedencia} />
              <Field label="Condición / seguro" value={h.seguro} />
              <Field label="Ingreso por servicio" value={h.servicioIngreso} />
              <Field label="Referido de" value={h.referido} />
              <Field label="Cama / N° HC" value={h.cama} />
            </div>
          </Sec>

          {/* 2 Enfermedad actual */}
          <Sec n={2} title="Enfermedad actual">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Field label="Motivo de consulta" value={h.motivoConsulta} />
              <Field label="Tiempo de enfermedad" value={h.tiempoEnfermedad} />
              <Field label="Forma de inicio" value={h.formaInicio} />
            </div>
            <Bloque label="Historia de la enfermedad actual (relato cronológico)" value={h.relato} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
              <Field label="Datos negativos importantes" value={h.datosNegativos} />
              <Field label="Funciones biológicas" value={h.funcionesBiologicas} />
            </div>
            <Bloque label="Revisión de sistemas" value={h.revisionSistemas} />
          </Sec>

          {/* 3 Antecedentes personales */}
          <Sec n={3} title="Antecedentes personales">
            <Bloque label="Perinatales" value={h.antPerinatales} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
              <Field label="Peso al nacer" value={h.pesoNacer} />
              <Field label="Talla al nacer" value={h.tallaNacer} />
              <Field label="Apgar" value={h.apgar} />
            </div>
            <Bloque label="Nutricionales" value={h.antNutricionales} />
            <Bloque label="Crecimiento y desarrollo" value={h.desarrollo} />
            <Bloque label="Escolaridad / rendimiento / conducta" value={h.escolaridad} />
            <Bloque label="Inmunizaciones" value={h.inmunizaciones} />
            <Bloque label="Patológicos" value={h.antPatologicos} />
          </Sec>

          {/* 4-5 Familiares y socioeconómicos */}
          <Sec n={4} title="Antecedentes familiares y socioeconómicos">
            <Bloque label="Familiares" value={h.antFamiliares} />
            <Bloque label="Socioeconómicos / entorno" value={h.antSocioeconomicos} />
          </Sec>

          {/* 7 Examen físico */}
          <Sec n={7} title="Examen físico · somatometría">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Field label="Peso" value={h.peso} />
              <Field label="Talla" value={h.talla} />
              <Field label="P. cefálico" value={h.pc} />
              <Field label="P. abdominal" value={h.perimetroAbdominal} />
              <Field label="IMC" value={h.imc} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              <Field label="FC" value={h.fc} />
              <Field label="FR" value={h.fr} />
              <Field label="T/A" value={h.ta} />
              <Field label="T°" value={h.temperatura} />
              <Field label="Percentiles" value={h.percentiles} />
            </div>
            <Bloque label="Inspección general" value={h.inspeccionGeneral} />
          </Sec>

          {/* 10 Hipótesis diagnóstica */}
          <Sec n={10} title="Hipótesis diagnóstica">
            <Bloque label="De la patología" value={h.dxPatologia} />
            <Bloque label="Crecimiento, desarrollo y estado de nutrición" value={h.dxCrecimiento} />
          </Sec>

          {/* 11-12 Planes */}
          <Sec n={11} title="Plan de estudio y manejo inicial">
            <Bloque label="Plan de estudio / comprobación del diagnóstico" value={h.planEstudio} />
            <Bloque label="Plan de manejo inicial" value={h.planManejo} />
          </Sec>

          {/* Profesional */}
          <Sec title="Médico que elaboró la historia">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Field label="Profesional" value={e ? `${e.nombres} ${e.apellidos}` : ""} w="34%" />
              <Field label="Colegio profesional" value={e?.cmp} />
              <Field label="Consultorio" value={e?.consultorio} />
              <Field label="Turno" value={e?.turno} />
              <Field label="Código pers. de salud" value={e?.codigoSalud} />
            </div>
          </Sec>

          <div style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#9aa2ad" }}>
            Representación impresa de la historia clínica pediátrica · Consultorios Médicos Intimas (mockup de demostración)
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display:none !important; } @page { margin: 10mm; size: A4; } html, body { background:#fff !important; } }`}</style>
    </div>
  );
}
