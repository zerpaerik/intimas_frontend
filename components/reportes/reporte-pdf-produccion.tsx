"use client";

import Image from "next/image";
import { Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPEN, formatDate, formatDateLong } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { SEDES } from "@/lib/auth/roles";
import { type PorProfesionalResponse, type PorServicioResponse } from "@/lib/api/reportes";

export function ReportePdfProduccion({
  tipo,
  desde,
  hasta,
  sedeId,
}: {
  tipo: string;
  desde?: string;
  hasta?: string;
  sedeId?: string;
}) {
  const esServicio = tipo === "por-servicio";
  const qs = new URLSearchParams();
  if (desde) qs.set("desde", desde);
  if (hasta) qs.set("hasta", hasta);
  if (sedeId) qs.set("sedeId", sedeId);
  const url = `/reportes/${esServicio ? "por-servicio" : "por-profesional"}?${qs.toString()}`;
  const { data, loading } = useApiItem<PorServicioResponse & PorProfesionalResponse>(url);

  const sedeLabel = sedeId ? SEDES.find((s) => String(s.id) === sedeId)?.name ?? `Sede ${sedeId}` : "Todas las sedes";
  const rango = desde && hasta ? `${formatDate(desde)} — ${formatDate(hasta)}` : desde ? `Desde ${formatDate(desde)}` : "Todas las fechas";
  const titulo = esServicio ? "Producción por servicio" : "Producción por profesional";

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando reporte…</div>;
  }
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        No se pudo generar el reporte.
        <Button variant="outline" onClick={() => window.close()}>Cerrar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 text-slate-800 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[900px] items-center justify-between px-4">
        <Button variant="outline" onClick={() => window.close()}><X className="h-4 w-4" /> Cerrar</Button>
        <Button className="bg-brand-gradient text-white" onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimir / Guardar PDF</Button>
      </div>

      <div className="mx-auto max-w-[900px] bg-white px-4 print:max-w-none print:px-0">
        <div className="rounded-xl border border-slate-200 p-8 shadow-sm print:rounded-none print:border-0 print:p-2 print:shadow-none">
          <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
            <div className="flex items-start gap-3">
              <Image src="/brand/logobn.jpeg" alt="Valmedic" width={120} height={56} className="h-12 w-auto object-contain" />
              <div className="text-xs leading-relaxed text-slate-500">
                <p className="font-heading text-sm font-bold text-slate-800">Policlínico Valmedic</p>
                <p>RUC 20601234567</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-heading text-xl font-bold text-slate-800">{titulo}</p>
              <p className="text-sm text-slate-500">{sedeLabel} · {rango}</p>
              <p className="text-xs text-slate-400">Generado: {formatDateLong(new Date())}</p>
            </div>
          </div>

          {esServicio ? (
            <>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Total</p>
                  <p className="font-heading text-base font-bold tabular-nums">{data.total?.cantidad ?? 0} · {formatPEN(data.total?.monto ?? 0)}</p>
                </div>
                {(data.porTipo ?? []).slice(0, 4).map((t) => (
                  <div key={t.kind} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">{t.kind}</p>
                    <p className="font-heading text-lg font-bold tabular-nums">{t.cantidad}</p>
                  </div>
                ))}
              </div>
              <table className="mt-6 w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-300 text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="py-2 font-semibold">Servicio</th>
                    <th className="py-2 font-semibold">Tipo</th>
                    <th className="py-2 text-right font-semibold">Cantidad</th>
                    <th className="py-2 text-right font-semibold">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.porServicio ?? []).map((s, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1.5">{s.nombre}</td>
                      <td className="py-1.5 text-slate-500">{s.kind}</td>
                      <td className="py-1.5 text-right tabular-nums">{s.cantidad}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatPEN(s.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="mt-6 grid gap-8 sm:grid-cols-2">
              {[
                { t: "Consultas atendidas", rows: data.consultasPorProfesional ?? [] },
                { t: "Ecografías realizadas", rows: data.ecografiasPorProfesional ?? [] },
              ].map((sec) => (
                <div key={sec.t}>
                  <p className="mb-2 font-heading text-sm font-bold text-slate-800">{sec.t}</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-300 text-left text-[11px] uppercase tracking-wide text-slate-500">
                        <th className="py-2 font-semibold">Profesional</th>
                        <th className="py-2 text-right font-semibold">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.rows.map((r, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-1.5">{r.profesional}</td>
                          <td className="py-1.5 text-right tabular-nums">{r.cantidad}</td>
                        </tr>
                      ))}
                      {sec.rows.length === 0 && <tr><td colSpan={2} className="py-3 text-center text-slate-400">Sin datos</td></tr>}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
            <p>Policlínico Valmedic · Reporte interno (mockup de demostración).</p>
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display: none !important; } @page { margin: 12mm; size: A4; } html, body { background: #fff !important; } }`}</style>
    </div>
  );
}
