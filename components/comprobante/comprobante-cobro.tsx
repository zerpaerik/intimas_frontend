"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPEN } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { type Atencion } from "@/lib/api/atenciones";

const fmt = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const serie = (pre: string, id: number, sedeId?: number | null) => `${pre}${String(sedeId ?? 1).padStart(3, "0")}-${String(id).padStart(8, "0")}`;

const Hr = () => <div style={{ borderTop: "1px dashed #9aa2ad", margin: "6px 0" }} />;
function Row({ l, v, bold, color }: { l: string; v: string; bold?: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontWeight: bold ? 800 : 700, color }}>
      <span>{l}</span>
      <span style={{ fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{v}</span>
    </div>
  );
}

export function ComprobanteCobro({ atencionId, pagoId }: { atencionId: number; pagoId?: number }) {
  const { data: a, loading } = useApiItem<Atencion>(atencionId ? `/atenciones/${atencionId}` : null);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando recibo…</div>;
  }
  const cobros = (a?.pagos ?? []).filter((p) => p.tipo === "COBRO");
  const pago = a?.pagos.find((p) => p.id === pagoId) ?? cobros[cobros.length - 1];
  if (!a || !pago) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        No se encontró el cobro.
        <Button variant="outline" onClick={() => window.close()}>Cerrar</Button>
      </div>
    );
  }

  const nombre = `${a.paciente?.nombres ?? ""} ${a.paciente?.apellidos ?? ""}`.trim();
  const dt = new Date(pago.fecha);
  const total = Number(a.total);
  const pagado = Number(a.pagado);
  const saldo = Number(a.saldo);

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="no-print mb-3 flex items-center justify-between gap-2" style={{ width: "80mm", maxWidth: "92vw" }}>
        <Button variant="outline" size="sm" onClick={() => window.close()}><X className="h-4 w-4" /> Cerrar</Button>
        <Button size="sm" className="bg-brand-gradient text-white" onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimir</Button>
      </div>

      <div id="ticket" className="bg-white shadow-sm print:shadow-none" style={{ width: "80mm" }}>
        <div style={{ padding: "5mm 4mm", fontSize: 12, lineHeight: 1.45, fontWeight: 700, color: "#1f2937" }}>
          <div style={{ textAlign: "center" }}>
            <Image src="/brand/logobn.jpeg" alt="Valmedic" width={140} height={56} className="mx-auto h-10 w-auto object-contain" />
            <div style={{ fontWeight: 700, marginTop: 4 }}>Policlínico Valmedic</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>íntimas</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{a.sede?.nombre ?? "Sede Principal"}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>RUC 20601234567</div>
          </div>

          <Hr />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700 }}>RECIBO DE COBRO</div>
            <div style={{ fontVariantNumeric: "tabular-nums" }}>{serie("RC", pago.id, a.sedeId)}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{fmt.format(dt)}</div>
          </div>

          <Hr />
          <div><b>Paciente:</b> {nombre || "—"}</div>
          <div style={{ color: "#6b7280" }}>{a.paciente?.tipoDoc} {a.paciente?.numDoc}</div>
          <div style={{ color: "#6b7280" }}>Atención: {serie("B", a.id, a.sedeId)}</div>

          <Hr />
          <Row l="Método" v={pago.metodo} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 700, marginTop: 4 }}>
            <span>MONTO COBRADO</span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 16, color: "#16a34a" }}>{formatPEN(Number(pago.monto))}</span>
          </div>

          <Hr />
          <Row l="Total atención" v={formatPEN(total)} />
          <Row l="Pagado a la fecha" v={formatPEN(pagado)} color="#16a34a" />
          <Row l={saldo > 0.001 ? "Saldo pendiente" : "Saldo"} v={formatPEN(saldo)} bold color={saldo > 0.001 ? "#dc2626" : undefined} />

          <Hr />
          <div style={{ textAlign: "center", fontSize: 11, color: "#6b7280" }}>
            <div style={{ fontWeight: 600 }}>¡Gracias por su pago!</div>
            <div>Recibo de cobro a cuenta · sin validez tributaria</div>
            <div>(mockup de demostración)</div>
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display: none !important; } @page { size: 80mm auto; margin: 0; } html, body { background: #fff !important; } #ticket { box-shadow: none !important; } }`}</style>
    </div>
  );
}
