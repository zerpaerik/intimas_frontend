"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calcAge, formatDateLong } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { esGineco, type Consulta } from "@/lib/api/consultas";

const HEAD = "#9B2D69";

function Sec({ n, title, accent, children }: { n?: number; title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ background: accent, color: "#fff", fontSize: 12, fontWeight: 500, padding: "3px 8px", borderRadius: 3 }}>
        {n != null ? `${n}. ` : ""}{title}
      </div>
      <div style={{ border: "1px solid #d9d2d6", borderTop: "none", padding: 10 }}>{children}</div>
    </div>
  );
}
function Field({ label, value, w }: { label: string; value?: string | null; w?: string }) {
  return (
    <div style={{ flex: w ? `0 0 ${w}` : "1", minWidth: 0 }}>
      <div style={{ fontSize: 10, color: "#8a8088", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13, minHeight: 18, whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>{value || "—"}</div>
    </div>
  );
}

export function ComprobanteHistoria({ id }: { id: number }) {
  const { data: c, loading } = useApiItem<Consulta>(id ? `/consultas/${id}` : null);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando historia…</div>;
  }
  if (!c || !c.historia) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        Esta consulta aún no tiene historia registrada.
        <Button variant="outline" onClick={() => window.close()}>Cerrar</Button>
      </div>
    );
  }

  const h = c.historia;
  const p = c.paciente;
  const e = c.especialista;
  const gineco = esGineco(c);
  const accent = gineco ? HEAD : "#0c447c";
  const nombre = `${p?.nombres ?? ""} ${p?.apellidos ?? ""}`.trim();
  const edad = p?.fechaNacimiento ? calcAge(String(p.fechaNacimiento)) : null;

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0" style={{ color: "#2c2c2a", overflowWrap: "anywhere", wordBreak: "break-word" }}>
      <div className="no-print mx-auto mb-4 flex max-w-[820px] items-center justify-between px-4">
        <Button variant="outline" onClick={() => window.close()}><X className="h-4 w-4" /> Cerrar</Button>
        <Button className="bg-brand-gradient text-white" onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimir / Guardar PDF</Button>
      </div>

      <div className="mx-auto max-w-[820px] bg-white px-4 print:max-w-none print:px-0">
        <div style={{ padding: 24 }} className="print:p-2">
          {/* Encabezado */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: `2px solid ${accent}`, paddingBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Image src="/brand/intimas-logo.png" alt="Intimas" width={120} height={52} style={{ height: 46, width: "auto", objectFit: "contain" }} />
              <div style={{ fontSize: 11, color: "#6b6168" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#2c2c2a" }}>Consultorios Médicos Intimas</div>
                <div>{gineco ? "Consultorio Femenino · Ginecología" : "Medicina General y Especialidades"}</div>
                <div>RUC 20601234567</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: accent }}>Historia clínica</div>
              <div style={{ fontSize: 12, color: "#8a8088" }}>N° {String(c.id).padStart(6, "0")} · {formatDateLong(c.fecha)}</div>
            </div>
          </div>

          {/* 1 Filiación */}
          <Sec n={1} title="Filiación" accent={accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Field label="Paciente" value={nombre} w="38%" />
              <Field label="DNI" value={`${p?.tipoDoc ?? ""} ${p?.numDoc ?? ""}`.trim()} />
              <Field label="Sexo" value={p?.sexo} />
              <Field label="Edad" value={edad != null ? `${edad} años` : ""} />
              <Field label="Fec. atención" value={formatDateLong(c.fecha)} />
              <Field label="N° celular" value={p?.telefono} />
              {gineco && <Field label="Facebook" value={p?.facebook} />}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8, borderTop: "1px dashed #e3dde0", paddingTop: 8 }}>
              <Field label="Familiar" value={p?.familiarNombre} w="38%" />
              <Field label="Parentesco" value={p?.familiarParentesco} />
              <Field label="DNI" value={p?.familiarDni} />
            </div>
          </Sec>

          {/* 2 Enfermedad actual */}
          <Sec n={2} title="Enfermedad actual" accent={accent}>
            <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              <Field label="Inicio" value={h.enfInicio} /><Field label="Curso" value={h.enfCurso} />
            </div>
            <Field label="Relato" value={h.enfRelato} />
          </Sec>

          {/* 3 Antecedentes */}
          <Sec n={3} title="Antecedentes" accent={accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Field label="Personales" value={p?.antPersonales} />
              <Field label="Familiares" value={p?.antFamiliares} />
              <Field label="Epidemiológicos" value={p?.antEpidemiologicos} />
              <Field label="Quirúrgicos" value={p?.antQuirurgicos} />
              <Field label="Otros" value={p?.antOtros} />
            </div>
          </Sec>

          {/* 4 Examen clínico */}
          <Sec n={4} title="Examen clínico · funciones vitales" accent={accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Field label="Peso" value={h.peso} /><Field label="FC" value={h.fc} /><Field label="FR" value={h.fr} />
              <Field label="P/A" value={h.presionArterial} /><Field label="Talla" value={h.talla} /><Field label="T°" value={h.temperatura} />
            </div>
            <div style={{ marginTop: 8 }}><Field label="Examen general" value={h.examenGeneral} /></div>
          </Sec>

          {/* 5 Impresión diagnóstica */}
          <Sec n={5} title="Impresión diagnóstica" accent={accent}>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead><tr style={{ textAlign: "left", fontSize: 10, color: "#8a8088", textTransform: "uppercase" }}><th style={{ width: 90, paddingBottom: 4 }}>CIE-10</th><th style={{ paddingBottom: 4 }}>Descripción</th></tr></thead>
              <tbody>
                {(h.diagnosticos ?? []).map((d, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #efeaec" }}><td style={{ padding: "3px 0", fontWeight: 500 }}>{d.cie10}</td><td style={{ padding: "3px 0" }}>{d.descripcion || "—"}</td></tr>
                ))}
              </tbody>
            </table>
          </Sec>

          {/* 6 Procedimientos */}
          <Sec n={6} title="Procedimientos · exámenes aux. · intervenciones" accent={accent}>
            <div style={{ fontSize: 13, minHeight: 18, whiteSpace: "pre-wrap" }}>{h.procedimientos || "—"}</div>
          </Sec>

          {/* 7 Tratamiento */}
          <Sec n={7} title="Tratamiento" accent={accent}>
            {(h.tratamientos ?? []).length === 0 ? (
              <div style={{ fontSize: 13 }}>—</div>
            ) : (
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead><tr style={{ textAlign: "left", fontSize: 10, color: "#8a8088", textTransform: "uppercase" }}><th style={{ paddingBottom: 4 }}>Medicamento</th><th>Presentación</th><th>Cant.</th><th>Dosis</th><th>Días</th></tr></thead>
                <tbody>
                  {(h.tratamientos ?? []).map((t, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #efeaec" }}>
                      <td style={{ padding: "3px 0" }}>{t.medicamento}</td><td>{t.presentacion || "—"}</td><td>{t.cantidad || "—"}</td><td>{t.dosis || "—"}</td><td>{t.dias || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Sec>

          {/* 8 Observaciones */}
          <Sec n={8} title="Observaciones (referencia · próxima cita · interconsulta)" accent={accent}>
            <div style={{ fontSize: 13, minHeight: 18, whiteSpace: "pre-wrap" }}>{h.observaciones || "—"}</div>
          </Sec>

          {/* Datos del profesional */}
          <Sec title="Datos del profesional" accent={accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Field label="Profesional" value={e ? `${e.nombres} ${e.apellidos}` : ""} w="34%" />
              <Field label="Colegio profesional" value={e?.cmp} />
              <Field label="Consultorio" value={e?.consultorio} />
              <Field label="Turno" value={e?.turno} />
              <Field label="Código pers. de salud" value={e?.codigoSalud} />
            </div>
          </Sec>

          <div style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#a39aa0" }}>
            Representación impresa de la historia clínica · Consultorios Médicos Intimas (mockup de demostración)
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display:none !important; } @page { margin: 10mm; size: A4; } html, body { background:#fff !important; } }`}</style>
    </div>
  );
}
