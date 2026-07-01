"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calcAge, formatDate, formatDateLong } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { type Consulta } from "@/lib/api/consultas";

const ACCENT = "#993556";

function semFromFum(iso?: string | null) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return diff > 0 ? Math.floor(diff / (7 * 86400000)) : 0;
}
function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ background: ACCENT, color: "#fff", fontSize: 12, fontWeight: 500, padding: "3px 8px", borderRadius: 3 }}>{title}</div>
      <div style={{ border: "1px solid #d9d2d6", borderTop: "none", padding: 10 }}>{children}</div>
    </div>
  );
}
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 10, color: "#8a8088", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13, whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>{value || "—"}</div>
    </div>
  );
}

export function ComprobanteControl({ id }: { id: number }) {
  const { data: c, loading } = useApiItem<Consulta>(id ? `/consultas/${id}` : null);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando carné…</div>;
  }
  const gx = c?.control?.gestacion;
  if (!c || !gx) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        Esta consulta aún no tiene control prenatal registrado.
        <Button variant="outline" onClick={() => window.close()}>Cerrar</Button>
      </div>
    );
  }

  const p = c.paciente;
  const e = c.especialista;
  const nombre = `${p?.nombres ?? ""} ${p?.apellidos ?? ""}`.trim();
  const edad = p?.fechaNacimiento ? calcAge(String(p.fechaNacimiento)) : null;
  const sem = semFromFum(gx.fum);
  const controles = gx.controles ?? [];
  const ultimo = controles[controles.length - 1];

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0" style={{ color: "#2c2c2a", overflowWrap: "anywhere", wordBreak: "break-word" }}>
      <div className="no-print mx-auto mb-4 flex max-w-[820px] items-center justify-between px-4">
        <Button variant="outline" onClick={() => window.close()}><X className="h-4 w-4" /> Cerrar</Button>
        <Button className="bg-brand-gradient text-white" onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimir / Guardar PDF</Button>
      </div>

      <div className="mx-auto max-w-[820px] bg-white px-4 print:max-w-none print:px-0">
        <div style={{ padding: 24 }} className="print:p-2">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: `2px solid ${ACCENT}`, paddingBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Image src="/brand/logobn.jpeg" alt="Valmedic" width={120} height={52} style={{ height: 46, width: "auto", objectFit: "contain" }} />
              <div style={{ fontSize: 11, color: "#6b6168" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#2c2c2a" }}>Policlínico Valmedic</div>
                <div>Consultorio Femenino · Obstetricia · RUC 20601234567</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: ACCENT }}>Carné de control prenatal</div>
              <div style={{ fontSize: 12, color: "#8a8088" }}>N° {String(gx.id).padStart(6, "0")} · {formatDateLong(c.fecha)}</div>
            </div>
          </div>

          <Sec title="Gestante">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <Field label="Paciente" value={`${nombre}${edad != null ? ` · ${edad} años` : ""}`} />
              <Field label="DNI" value={`${p?.tipoDoc ?? ""} ${p?.numDoc ?? ""}`.trim()} />
              <Field label="FUM" value={gx.fum ? formatDate(gx.fum) : null} />
              <Field label="FPP" value={gx.fpp ? formatDate(gx.fpp) : null} />
              <Field label="Edad gest." value={sem != null ? `${sem} sem` : null} />
              <Field label="Grupo" value={`${gx.tipoSangre ?? ""} ${gx.factorRh ?? ""}`.trim()} />
              <Field label="Estado" value={gx.estado} />
            </div>
          </Sec>

          <Sec title="Antecedentes obstétricos">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, fontSize: 12 }}>
              <span>Gestas <b>{gx.gestas ?? "—"}</b></span><span>Partos <b>{gx.partos ?? "—"}</b></span><span>Abortos <b>{gx.abortos ?? "—"}</b></span>
              <span>Cesáreas <b>{gx.cesareas ?? "—"}</b></span><span>Vaginales <b>{gx.vaginales ?? "—"}</b></span><span>Nac. vivos <b>{gx.nacidosVivos ?? "—"}</b></span>
              <span>Viven <b>{gx.viven ?? "—"}</b></span><span>Nac. muertos <b>{gx.nacidosMuertos ?? "—"}</b></span>
            </div>
          </Sec>

          <Sec title="Controles del embarazo">
            {controles.length === 0 ? (
              <div style={{ fontSize: 13 }}>Aún no hay controles registrados.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                <thead><tr style={{ background: "#f6eef2", textAlign: "left", color: "#6b3a52" }}>
                  <th style={{ padding: "5px 6px" }}>Fecha</th><th>Sem</th><th>Peso</th><th>P/A</th><th>AU</th><th>FCF</th><th>Mov</th><th>Edema</th><th>Sulf.</th>
                </tr></thead>
                <tbody>
                  {controles.map((x) => (
                    <tr key={x.id} style={{ borderTop: "1px solid #e9e1e5" }}>
                      <td style={{ padding: "5px 6px" }}>{formatDate(x.fecha)}</td><td>{x.semanaGestacional ?? "—"}</td><td>{x.peso || "—"}</td>
                      <td>{x.presionArterial || "—"}</td><td>{x.alturaUterina || "—"}</td><td>{x.fcf || "—"}</td>
                      <td>{x.movimientosFetales || "—"}</td><td>{x.edema || "—"}</td><td>{x.sulfatoFerroso || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Sec>

          {ultimo && (
            <Sec title="Último control · diagnóstico y plan">
              <div style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
                <div><span style={{ color: "#8a8088" }}>Diagnóstico:</span> {ultimo.diagDefinitivo || ultimo.diagnostico || "—"}</div>
                <div style={{ marginTop: 4 }}><span style={{ color: "#8a8088" }}>Plan:</span> {ultimo.plan || "—"}</div>
                {ultimo.proximaCita && <div style={{ marginTop: 4 }}><span style={{ color: "#8a8088" }}>Próxima cita:</span> {ultimo.proximaCita}</div>}
              </div>
            </Sec>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, borderTop: "1px dashed #d9d2d6", marginTop: 14, paddingTop: 8 }}>
            <Field label="Profesional" value={e ? `${e.nombres} ${e.apellidos}` : ""} />
            <Field label="Colegio" value={e?.cmp} />
            <Field label="Consultorio" value={e?.consultorio} />
            <Field label="Turno" value={e?.turno} />
          </div>

          <div style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: "#a39aa0" }}>
            Carné de control prenatal · Policlínico Valmedic (mockup de demostración)
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display:none !important; } @page { margin: 10mm; size: A4; } html, body { background:#fff !important; } }`}</style>
    </div>
  );
}
