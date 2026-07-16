"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPEN } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { type Gasto } from "@/lib/api/gastos";

const fmt = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function nroEgreso(id: number, sedeId?: number | null) {
  const serie = `E${String(sedeId ?? 1).padStart(3, "0")}`;
  return `${serie}-${String(id).padStart(8, "0")}`;
}

const Hr = () => <div style={{ borderTop: "1px dashed #9aa2ad", margin: "6px 0" }} />;
function Dato({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return <div><span style={{ color: "#6b7280" }}>{label}: </span>{value}</div>;
}

export function ComprobanteGasto({ id }: { id: number }) {
  const { data: g, loading } = useApiItem<Gasto>(id ? `/gastos/${id}` : null);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando comprobante…</div>;
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
    <div className="flex min-h-screen flex-col items-center bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="no-print mb-3 flex items-center justify-between gap-2" style={{ width: "80mm", maxWidth: "92vw" }}>
        <Button variant="outline" size="sm" onClick={() => window.close()}><X className="h-4 w-4" /> Cerrar</Button>
        <Button size="sm" className="bg-brand-gradient text-white" onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimir</Button>
      </div>

      <div id="ticket" className="bg-white shadow-sm print:shadow-none" style={{ width: "80mm" }}>
        <div style={{ padding: "5mm 4mm", fontSize: 12, lineHeight: 1.45, fontWeight: 700, color: "#1f2937" }}>
          {/* Encabezado */}
          <div style={{ textAlign: "center" }}>
            <Image src="/brand/logobn.jpeg" alt="Valmedic" width={140} height={56} className="mx-auto h-10 w-auto object-contain" />
            <div style={{ fontWeight: 700, marginTop: 4 }}>Policlínico Valmedic</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>íntimas</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{g.sede?.nombre ?? "Sede Principal"}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>RUC 20601234567</div>
          </div>

          <Hr />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700 }}>COMPROBANTE DE EGRESO</div>
            <div style={{ fontVariantNumeric: "tabular-nums" }}>{nroEgreso(g.id, g.sedeId)}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{fmt.format(dt)}</div>
          </div>

          {g.anulada && (
            <div style={{ textAlign: "center", border: "1px solid #dc2626", color: "#dc2626", fontWeight: 700, padding: "2px 0", margin: "6px 0", letterSpacing: 2 }}>
              ANULADO{g.motivoAnulacion ? ` · ${g.motivoAnulacion}` : ""}
            </div>
          )}

          <Hr />
          <Dato label="Categoría" value={g.categoria} />
          <Dato label="Proveedor" value={g.proveedor} />
          <Dato label="Método" value={g.metodo} />
          <Dato label="Registró" value={g.usuario?.nombre} />

          <Hr />
          <div style={{ color: "#6b7280", fontSize: 11 }}>Concepto</div>
          <div style={{ fontWeight: 700, overflowWrap: "anywhere" }}>{g.descripcion}</div>
          {g.nota && <div style={{ color: "#6b7280", overflowWrap: "anywhere" }}>{g.nota}</div>}

          <Hr />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 700 }}>
            <span>TOTAL EGRESADO</span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 16, color: "#dc2626" }}>{formatPEN(Number(g.monto))}</span>
          </div>

          <div style={{ marginTop: 42, textAlign: "center", fontSize: 11, color: "#6b7280" }}>
            <div style={{ borderTop: "1px solid #4b5563", margin: "0 6mm", paddingTop: 3, color: "#1f2937", fontWeight: 600 }}>Recibí conforme</div>
            <div style={{ marginTop: 2 }}>Nombre · DNI · Firma</div>
          </div>

          <Hr />
          <div style={{ textAlign: "center", fontSize: 11, color: "#6b7280" }}>
            <div>Documento interno de control de caja</div>
            <div>(mockup de demostración)</div>
          </div>
        </div>
      </div>

      <style>{`#ticket, #ticket * { color: #000 !important; border-color: #000 !important; font-weight: 700 !important; } @media print { .no-print { display: none !important; } @page { size: 80mm auto; margin: 0; } html, body { background: #fff !important; } #ticket { box-shadow: none !important; } }`}</style>
    </div>
  );
}
