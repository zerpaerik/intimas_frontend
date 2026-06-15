"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPEN, formatDateLong } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { type Atencion } from "@/lib/api/atenciones";

const horaCorta = new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" });

/** Número de comprobante legible a partir del id (serie B001). */
function nroComprobante(id: number, sedeId?: number | null) {
  const serie = `B${String(sedeId ?? 1).padStart(3, "0")}`;
  return `${serie}-${String(id).padStart(8, "0")}`;
}

export function Comprobante({ id }: { id: number }) {
  const { data: a, loading } = useApiItem<Atencion>(id ? `/atenciones/${id}` : null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando comprobante…
      </div>
    );
  }
  if (!a) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        No se encontró la atención.
        <Button variant="outline" onClick={() => window.close()}>Cerrar</Button>
      </div>
    );
  }

  const nombre = `${a.paciente?.nombres ?? ""} ${a.paciente?.apellidos ?? ""}`.trim();
  const dt = new Date(a.fecha);
  const total = Number(a.total);
  const pagado = Number(a.pagado);
  const saldo = Number(a.saldo);

  return (
    <div className="min-h-screen bg-slate-100 py-8 text-slate-800 print:bg-white print:py-0">
      {/* Barra de acciones (no se imprime) */}
      <div className="no-print mx-auto mb-4 flex max-w-[820px] items-center justify-between px-4">
        <Button variant="outline" onClick={() => window.close()}>
          <X className="h-4 w-4" /> Cerrar
        </Button>
        <Button className="bg-brand-gradient text-white" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Imprimir / Guardar PDF
        </Button>
      </div>

      {/* Documento */}
      <div className="mx-auto max-w-[820px] bg-white px-4 print:max-w-none print:px-0">
        <div className="rounded-xl border border-slate-200 p-8 shadow-sm print:rounded-none print:border-0 print:p-2 print:shadow-none">
          {/* Encabezado */}
          <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
            <div className="flex items-start gap-3">
              <Image src="/brand/intimas-logo.png" alt="Intimas" width={120} height={56} className="h-14 w-auto object-contain" />
              <div className="text-xs leading-relaxed text-slate-500">
                <p className="font-heading text-sm font-bold text-slate-800">Consultorios Médicos Intimas</p>
                <p>Para Él y Ella</p>
                <p>{a.sede?.nombre ?? "Sede Principal"}</p>
                <p>RUC 20601234567</p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-300 px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Comprobante de atención</p>
              <p className="font-heading text-lg font-bold text-brand">{nroComprobante(a.id, a.sedeId)}</p>
              <p className="text-xs text-slate-500">{formatDateLong(a.fecha)} · {horaCorta.format(dt)}</p>
            </div>
          </div>

          {a.anulada && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-center text-sm font-bold uppercase tracking-widest text-red-600">
              Documento anulado
            </div>
          )}

          {/* Datos del paciente */}
          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Paciente</p>
              <p className="font-semibold">{nombre}</p>
              <p className="text-slate-500">{a.paciente?.tipoDoc} {a.paciente?.numDoc}</p>
              {a.paciente?.telefono && <p className="text-slate-500">Tel. {a.paciente.telefono}</p>}
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Atención</p>
              <p>Origen: <span className="font-medium">{a.origenTipo}</span></p>
              {a.origenValor && <p className="text-slate-500">{a.origenValor}</p>}
              <p className="text-slate-500">Atendió: {a.usuario?.nombre ?? "—"}</p>
            </div>
          </div>

          {/* Ítems */}
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="py-2 font-semibold">Cant.</th>
                <th className="py-2 font-semibold">Descripción</th>
                <th className="py-2 text-right font-semibold">Importe</th>
              </tr>
            </thead>
            <tbody>
              {a.items.map((it, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 align-top">1</td>
                  <td className="py-2">
                    <div className="font-medium">{it.nombre}</div>
                    <div className="text-xs text-slate-400">{it.kind}</div>
                  </td>
                  <td className="py-2 text-right tabular-nums">{formatPEN(Number(it.monto))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales */}
          <div className="mt-5 flex justify-end">
            <div className="w-full max-w-[16rem] space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-semibold tabular-nums">{formatPEN(total)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Pagado</span><span className="tabular-nums text-emerald-600">{formatPEN(pagado)}</span></div>
              <div className="flex justify-between border-t border-slate-300 pt-1.5 text-base">
                <span className="font-bold">{saldo > 0.001 ? "Saldo pendiente" : "Saldo"}</span>
                <span className={`font-bold tabular-nums ${saldo > 0.001 ? "text-red-600" : ""}`}>{formatPEN(saldo)}</span>
              </div>
            </div>
          </div>

          {/* Pagos */}
          {a.pagos.length > 0 && (
            <div className="mt-5 border-t border-slate-200 pt-3 text-sm">
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-slate-400">Pagos recibidos</p>
              <div className="space-y-1">
                {a.pagos.map((p) => (
                  <div key={p.id} className="flex justify-between text-slate-600">
                    <span>{p.metodo} · {p.tipo === "ABONO_INICIAL" ? "Abono inicial" : "Cobro"} · {formatDateLong(p.fecha)}</span>
                    <span className="tabular-nums">{formatPEN(Number(p.monto))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pie */}
          <div className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
            <p className="font-medium text-slate-500">¡Gracias por su preferencia!</p>
            <p>Representación impresa del comprobante de atención · Consultorios Médicos Intimas</p>
            <p>Este documento no tiene validez tributaria (mockup de demostración).</p>
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display: none !important; } @page { margin: 12mm; size: A4; } html, body { background: #fff !important; } }`}</style>
    </div>
  );
}
