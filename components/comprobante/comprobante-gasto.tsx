"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPEN, formatDateLong } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { type Gasto } from "@/lib/api/gastos";

const horaCorta = new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" });

function nroEgreso(id: number, sedeId?: number | null) {
  const serie = `E${String(sedeId ?? 1).padStart(3, "0")}`;
  return `${serie}-${String(id).padStart(8, "0")}`;
}

function Dato({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

export function ComprobanteGasto({ id }: { id: number }) {
  const { data: g, loading } = useApiItem<Gasto>(id ? `/gastos/${id}` : null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando comprobante…
      </div>
    );
  }
  if (!g) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        No se encontró el gasto.
        <Button variant="outline" onClick={() => window.close()}>Cerrar</Button>
      </div>
    );
  }

  const dt = new Date(g.fecha);

  return (
    <div className="min-h-screen bg-slate-100 py-8 text-slate-800 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[820px] items-center justify-between px-4">
        <Button variant="outline" onClick={() => window.close()}>
          <X className="h-4 w-4" /> Cerrar
        </Button>
        <Button className="bg-brand-gradient text-white" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Imprimir / Guardar PDF
        </Button>
      </div>

      <div className="mx-auto max-w-[820px] bg-white px-4 print:max-w-none print:px-0">
        <div className="rounded-xl border border-slate-200 p-8 shadow-sm print:rounded-none print:border-0 print:p-2 print:shadow-none">
          {/* Encabezado */}
          <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
            <div className="flex items-start gap-3">
              <Image src="/brand/intimas-logo.png" alt="Intimas" width={120} height={56} className="h-14 w-auto object-contain" />
              <div className="text-xs leading-relaxed text-slate-500">
                <p className="font-heading text-sm font-bold text-slate-800">Consultorios Médicos Intimas</p>
                <p>Para Él y Ella</p>
                <p>{g.sede?.nombre ?? "Sede Principal"}</p>
                <p>RUC 20601234567</p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-300 px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Comprobante de egreso</p>
              <p className="font-heading text-lg font-bold text-brand">{nroEgreso(g.id, g.sedeId)}</p>
              <p className="text-xs text-slate-500">{formatDateLong(g.fecha)} · {horaCorta.format(dt)}</p>
            </div>
          </div>

          {g.anulada && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-center text-sm font-bold uppercase tracking-widest text-red-600">
              Documento anulado{g.motivoAnulacion ? ` · ${g.motivoAnulacion}` : ""}
            </div>
          )}

          {/* Datos */}
          <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Dato label="Categoría" value={g.categoria} />
            <Dato label="Proveedor / beneficiario" value={g.proveedor} />
            <Dato label="Método de pago" value={g.metodo} />
            <Dato label="Registró" value={g.usuario?.nombre} />
            <Dato label="Sede" value={g.sede?.nombre} />
          </div>

          {/* Concepto */}
          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Concepto del egreso</p>
            <p className="mt-0.5 font-medium">{g.descripcion}</p>
            {g.nota && <p className="mt-1 text-slate-500">{g.nota}</p>}
          </div>

          {/* Monto */}
          <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-300 px-5 py-4">
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">Total egresado</span>
            <span className="font-heading text-2xl font-bold text-red-600">{formatPEN(Number(g.monto))}</span>
          </div>

          {/* Recibí conforme */}
          <div className="mt-12 grid grid-cols-2 gap-10 text-center text-xs text-slate-500">
            <div>
              <div className="border-t border-slate-400 pt-1.5">Entregado por</div>
              <p className="mt-1">{g.usuario?.nombre ?? ""}</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5">Recibí conforme</div>
              <p className="mt-1">Nombre / DNI / Firma</p>
            </div>
          </div>

          {/* Pie */}
          <div className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
            <p>Comprobante de egreso · Consultorios Médicos Intimas</p>
            <p>Documento interno de control de caja (mockup de demostración).</p>
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display: none !important; } @page { margin: 12mm; size: A4; } html, body { background: #fff !important; } }`}</style>
    </div>
  );
}
