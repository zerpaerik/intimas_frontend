"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPEN, formatDate, formatDateLong } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { SEDES } from "@/lib/auth/roles";

const METODOS = ["Efectivo", "Tarjeta", "Depósito", "Yape"];

interface PagoRow {
  id: number; fecha: string; metodo: string; tipo: string; monto: number;
  atencion?: { paciente?: { nombres: string; apellidos: string } } | null;
}
interface DetalleRow {
  atencionId: number; fecha: string; paciente: string; tipoServicio: string;
  concepto: string; metodos: string[]; sede?: string | null; monto: number;
}
interface ReporteData {
  pagos?: PagoRow[];
  rows?: DetalleRow[];
  porMetodo?: Record<string, number>;
  porTipo?: Record<string, number>;
  total: number;
  cantidad: number;
}

export function ReportePdf({
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
  const isIngresos = tipo === "ingresos";
  const qs = new URLSearchParams();
  if (desde) qs.set("desde", desde);
  if (hasta) qs.set("hasta", hasta);
  if (sedeId) qs.set("sedeId", sedeId);
  const url = `/reportes/${isIngresos ? "ingresos" : "detallado"}?${qs.toString()}`;
  const { data, loading } = useApiItem<ReporteData>(url);

  const sedeLabel = sedeId ? (SEDES.find((s) => String(s.id) === sedeId)?.name ?? `Sede ${sedeId}`) : "Todas las sedes";
  const rango = desde && hasta ? `${formatDate(desde)} — ${formatDate(hasta)}` : desde ? `Desde ${formatDate(desde)}` : "Todas las fechas";
  const titulo = isIngresos ? "Reporte de ingresos" : "Detallado por sede";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando reporte…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        No se pudo generar el reporte.
        <Button variant="outline" onClick={() => window.close()}>Cerrar</Button>
      </div>
    );
  }

  const porTipo = Object.entries(data.porTipo ?? {}).map(([k, v]) => ({ k, v: Number(v) })).sort((a, b) => b.v - a.v);

  return (
    <div className="min-h-screen bg-slate-100 py-8 text-slate-800 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[900px] items-center justify-between px-4">
        <Button variant="outline" onClick={() => window.close()}>
          <X className="h-4 w-4" /> Cerrar
        </Button>
        <Button className="bg-brand-gradient text-white" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Imprimir / Guardar PDF
        </Button>
      </div>

      <div className="mx-auto max-w-[900px] bg-white px-4 print:max-w-none print:px-0">
        <div className="rounded-xl border border-slate-200 p-8 shadow-sm print:rounded-none print:border-0 print:p-2 print:shadow-none">
          {/* Encabezado */}
          <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
            <div className="flex items-start gap-3">
              <Image src="/brand/intimas-logo.png" alt="Intimas" width={120} height={56} className="h-12 w-auto object-contain" />
              <div className="text-xs leading-relaxed text-slate-500">
                <p className="font-heading text-sm font-bold text-slate-800">Consultorios Médicos Intimas</p>
                <p>RUC 20601234567</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-heading text-xl font-bold text-slate-800">{titulo}</p>
              <p className="text-sm text-slate-500">{sedeLabel} · {rango}</p>
              <p className="text-xs text-slate-400">Generado: {formatDateLong(new Date())}</p>
            </div>
          </div>

          {/* Resumen */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Total</p>
              <p className="font-heading text-xl font-bold">{formatPEN(Number(data.total))}</p>
            </div>
            {isIngresos
              ? METODOS.map((m) => (
                  <div key={m} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">{m}</p>
                    <p className="font-heading text-lg font-bold tabular-nums">{formatPEN(Number(data.porMetodo?.[m] ?? 0))}</p>
                  </div>
                ))
              : porTipo.slice(0, 4).map(({ k, v }) => (
                  <div key={k} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">{k}</p>
                    <p className="font-heading text-lg font-bold tabular-nums">{formatPEN(v)}</p>
                  </div>
                ))}
          </div>

          {/* Tabla */}
          {isIngresos ? (
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2 font-semibold">Fecha</th>
                  <th className="py-2 font-semibold">Paciente</th>
                  <th className="py-2 font-semibold">Tipo</th>
                  <th className="py-2 font-semibold">Método</th>
                  <th className="py-2 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {(data.pagos ?? []).map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-1.5">{formatDate(p.fecha)}</td>
                    <td className="py-1.5">{p.atencion?.paciente ? `${p.atencion.paciente.nombres} ${p.atencion.paciente.apellidos}` : "—"}</td>
                    <td className="py-1.5 text-slate-500">{p.tipo === "ABONO_INICIAL" ? "Abono inicial" : "Cobro"}</td>
                    <td className="py-1.5 text-slate-500">{p.metodo}</td>
                    <td className="py-1.5 text-right tabular-nums">{formatPEN(Number(p.monto))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2 font-semibold">Fecha</th>
                  <th className="py-2 font-semibold">Paciente</th>
                  <th className="py-2 font-semibold">Tipo servicio</th>
                  <th className="py-2 font-semibold">Concepto</th>
                  <th className="py-2 font-semibold">Pago</th>
                  <th className="py-2 font-semibold">Sede</th>
                  <th className="py-2 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {(data.rows ?? []).map((r, i) => (
                  <tr key={`${r.atencionId}-${i}`} className="border-b border-slate-100">
                    <td className="py-1.5 whitespace-nowrap">{formatDate(r.fecha)}</td>
                    <td className="py-1.5">{r.paciente}</td>
                    <td className="py-1.5">{r.tipoServicio}</td>
                    <td className="py-1.5 text-slate-500">{r.concepto}</td>
                    <td className="py-1.5 text-slate-500">{r.metodos?.length ? r.metodos.join(" + ") : "—"}</td>
                    <td className="py-1.5 text-slate-500">{r.sede ?? "—"}</td>
                    <td className="py-1.5 text-right tabular-nums">{formatPEN(Number(r.monto))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-4 flex justify-end border-t border-slate-300 pt-3">
            <div className="flex w-full max-w-[16rem] justify-between text-base">
              <span className="font-bold">Total {isIngresos ? "ingresos" : "servicios"}</span>
              <span className="font-bold tabular-nums">{formatPEN(Number(data.total))}</span>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
            <p>{data.cantidad} registro{data.cantidad === 1 ? "" : "s"} · Consultorios Médicos Intimas</p>
            <p>Reporte interno (mockup de demostración).</p>
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display: none !important; } @page { margin: 12mm; size: A4; } html, body { background: #fff !important; } }`}</style>
    </div>
  );
}
