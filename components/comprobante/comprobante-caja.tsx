"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPEN } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { METODOS_CAJA, type CajaDetalle } from "@/lib/api/caja";

const ACCENT = "#0c447c";
const n = (x: unknown) => Number(x ?? 0);
function fechaHora(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-PE", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ background: ACCENT, color: "#fff", fontSize: 12, fontWeight: 500, padding: "3px 8px", borderRadius: 3 }}>{title}</div>
      <div style={{ border: "1px solid #d3dae3", borderTop: "none", padding: 10 }}>{children}</div>
    </div>
  );
}
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: 10, color: "#7c8794", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13, overflowWrap: "anywhere" }}>{value || "—"}</div>
    </div>
  );
}

export function ComprobanteCaja({ id }: { id: number }) {
  const { data, loading } = useApiItem<CajaDetalle>(id ? `/caja/${id}` : null);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando cierre…</div>;
  }
  if (!data || !data.caja) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        No se encontró la caja.
        <Button variant="outline" onClick={() => window.close()}>Cerrar</Button>
      </div>
    );
  }

  const { caja, resumen, pagos, gastos } = data;
  const porTipo = Object.entries(data.porTipoServicio ?? {}).sort((a, b) => b[1] - a[1]);
  const arqueo = caja.arqueo;
  const cerrada = caja.estado === "Cerrada";
  const th: React.CSSProperties = { textAlign: "right", padding: "4px 6px", fontSize: 11 };
  const td: React.CSSProperties = { textAlign: "right", padding: "4px 6px", fontSize: 12 };

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0" style={{ color: "#23282e" }}>
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
                <div>Cierre de caja · RUC 20601234567</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: ACCENT }}>Cierre de caja</div>
              <div style={{ fontSize: 12, color: "#7c8794" }}>N° {String(caja.id).padStart(6, "0")} · {cerrada ? "Cerrada" : "Abierta"}</div>
            </div>
          </div>

          {/* Datos del turno */}
          <Sec title="Datos del turno">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Field label="Cajero" value={caja.usuario?.nombre} />
              <Field label="Sede" value={caja.sede?.nombre} />
              <Field label="Fondo inicial" value={formatPEN(n(caja.montoInicial))} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              <Field label="Apertura" value={fechaHora(caja.fechaApertura)} />
              <Field label="Cierre" value={cerrada ? fechaHora(caja.fechaCierre) : "En curso"} />
              <Field label="Cerrada por" value={caja.cerradaPor?.nombre} />
            </div>
          </Sec>

          {/* Resumen por método */}
          <Sec title="Resumen del turno">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: "#eef2f7", color: "#46505c" }}>
                <th style={{ textAlign: "left", padding: "4px 6px", fontSize: 11 }}>Método</th>
                <th style={th}>Ingresos</th><th style={th}>Gastos</th><th style={th}>Esperado en caja</th>
              </tr></thead>
              <tbody>
                {METODOS_CAJA.map((m) => (
                  <tr key={m} style={{ borderTop: "1px solid #e6ebf1" }}>
                    <td style={{ padding: "4px 6px" }}>{m}</td>
                    <td style={td}>{formatPEN(resumen.ingresos[m] ?? 0)}</td>
                    <td style={td}>{formatPEN(resumen.gastos[m] ?? 0)}</td>
                    <td style={{ ...td, fontWeight: 500 }}>{formatPEN(resumen.esperado[m] ?? 0)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #d3dae3", fontWeight: 700 }}>
                  <td style={{ padding: "4px 6px" }}>Total</td>
                  <td style={td}>{formatPEN(resumen.totalIngresos)}</td>
                  <td style={td}>{formatPEN(resumen.totalGastos)}</td>
                  <td style={td}>{formatPEN(METODOS_CAJA.reduce((s, m) => s + (resumen.esperado[m] ?? 0), 0))}</td>
                </tr>
              </tbody>
            </table>
          </Sec>

          {/* Por tipo de servicio */}
          {porTipo.length > 0 && (
            <Sec title="Por tipo de servicio">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <tbody>
                  {porTipo.map(([kind, monto]) => (
                    <tr key={kind} style={{ borderTop: "1px solid #e6ebf1" }}>
                      <td style={{ padding: "4px 6px" }}>{kind}</td>
                      <td style={td}>{formatPEN(monto)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "2px solid #d3dae3", fontWeight: 700 }}>
                    <td style={{ padding: "4px 6px" }}>Total</td>
                    <td style={td}>{formatPEN(porTipo.reduce((s, [, m]) => s + m, 0))}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ fontSize: 10, color: "#9aa2ad", marginTop: 4 }}>Servicios de las atenciones cobradas en el turno.</div>
            </Sec>
          )}

          {/* Arqueo (solo cerrada) */}
          {cerrada && arqueo && (
            <Sec title="Arqueo (conteo de cierre)">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: "#eef2f7", color: "#46505c" }}>
                  <th style={{ textAlign: "left", padding: "4px 6px", fontSize: 11 }}>Método</th>
                  <th style={th}>Esperado</th><th style={th}>Contado</th><th style={th}>Diferencia</th>
                </tr></thead>
                <tbody>
                  {METODOS_CAJA.map((m) => {
                    const dif = n(arqueo.diferencia?.[m]);
                    return (
                      <tr key={m} style={{ borderTop: "1px solid #e6ebf1" }}>
                        <td style={{ padding: "4px 6px" }}>{m}</td>
                        <td style={td}>{formatPEN(n(arqueo.esperado?.[m]))}</td>
                        <td style={td}>{formatPEN(n(arqueo.contado?.[m]))}</td>
                        <td style={{ ...td, color: Math.abs(dif) < 0.001 ? "#16a34a" : dif > 0 ? "#b45309" : "#dc2626" }}>{dif > 0 ? "+" : ""}{formatPEN(dif)}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: "2px solid #d3dae3", fontWeight: 700 }}>
                    <td colSpan={3} style={{ padding: "4px 6px", textAlign: "right" }}>Diferencia total</td>
                    <td style={td}>{formatPEN(n(caja.totalDiferencia))}</td>
                  </tr>
                </tbody>
              </table>
            </Sec>
          )}

          {/* Movimientos: ingresos */}
          <Sec title={`Ingresos del turno (${pagos.length})`}>
            {pagos.length === 0 ? <div style={{ fontSize: 12 }}>Sin pagos.</div> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                <thead><tr style={{ textAlign: "left", color: "#7c8794" }}>
                  <th style={{ padding: "3px 4px" }}>Fecha</th><th>Paciente</th><th>Tipo</th><th>Método</th><th style={{ textAlign: "right" }}>Monto</th>
                </tr></thead>
                <tbody>
                  {pagos.map((p) => (
                    <tr key={p.id} style={{ borderTop: "1px solid #eef0f3", textDecoration: p.anulado ? "line-through" : "none", color: p.anulado ? "#9aa2ad" : "inherit" }}>
                      <td style={{ padding: "3px 4px" }}>{fechaHora(p.fecha)}</td>
                      <td>{p.atencion?.paciente ? `${p.atencion.paciente.nombres} ${p.atencion.paciente.apellidos}` : "—"}</td>
                      <td>{p.tipo === "COBRO" ? "Cobro" : "Abono"}</td>
                      <td>{p.metodo}</td>
                      <td style={{ textAlign: "right" }}>{formatPEN(n(p.monto))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Sec>

          {/* Movimientos: gastos */}
          <Sec title={`Gastos del turno (${gastos.length})`}>
            {gastos.length === 0 ? <div style={{ fontSize: 12 }}>Sin gastos.</div> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                <thead><tr style={{ textAlign: "left", color: "#7c8794" }}>
                  <th style={{ padding: "3px 4px" }}>Fecha</th><th>Descripción</th><th>Método</th><th style={{ textAlign: "right" }}>Monto</th>
                </tr></thead>
                <tbody>
                  {gastos.map((g) => (
                    <tr key={g.id} style={{ borderTop: "1px solid #eef0f3", textDecoration: g.anulada ? "line-through" : "none", color: g.anulada ? "#9aa2ad" : "inherit" }}>
                      <td style={{ padding: "3px 4px" }}>{fechaHora(g.fecha)}</td>
                      <td style={{ overflowWrap: "anywhere" }}>{g.descripcion}</td>
                      <td>{g.metodo}</td>
                      <td style={{ textAlign: "right" }}>{formatPEN(n(g.monto))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Sec>

          {(caja.observacionApertura || caja.observacionCierre) && (
            <Sec title="Observaciones">
              {caja.observacionApertura && <div style={{ fontSize: 12 }}><b>Apertura:</b> {caja.observacionApertura}</div>}
              {caja.observacionCierre && <div style={{ fontSize: 12, marginTop: 4 }}><b>Cierre:</b> {caja.observacionCierre}</div>}
            </Sec>
          )}

          <div style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#9aa2ad" }}>
            Reporte de cierre de caja · Consultorios Médicos Intimas (mockup de demostración)
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display:none !important; } @page { margin: 10mm; size: A4; } html, body { background:#fff !important; } }`}</style>
    </div>
  );
}
