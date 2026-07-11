"use client";

import * as React from "react";
import Image from "next/image";
import { Download, Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calcAge, formatDateLong } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { API_URL } from "@/lib/config";
import { esArchivo, type Resultado } from "@/lib/api/resultados";

const ACCENT = "#0c447c";

function HeadField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ fontSize: 12 }}>
      <span style={{ color: "#8a8088" }}>{label}: </span>
      <span style={{ color: "#2c2c2a", fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

export function ComprobanteResultado({ id }: { id: number }) {
  const { data: r, loading } = useApiItem<Resultado>(id ? `/resultados/${id}` : null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando informe…
      </div>
    );
  }
  if (!r) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        No se encontró el resultado.
        <Button variant="outline" onClick={() => window.close()}>Cerrar</Button>
      </div>
    );
  }

  // Si es archivo adjunto, este comprobante no aplica: ofrecemos abrir el archivo.
  if (esArchivo(r)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-600">
        Este resultado es un archivo adjunto.
        <Button className="bg-brand-gradient text-white" onClick={() => window.open(`${API_URL}/resultados/${r.id}/archivo`, "_blank")}>
          <Download className="h-4 w-4" /> Abrir archivo
        </Button>
      </div>
    );
  }

  const p = r.paciente;
  const nombre = `${p?.nombres ?? ""} ${p?.apellidos ?? ""}`.trim();
  const edad = p?.fechaNacimiento ? calcAge(String(p.fechaNacimiento)) : null;
  const medico = r.profesional ? `${r.profesional.nombres} ${r.profesional.apellidos}`.trim() : "";

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0" style={{ color: "#2c2c2a", overflowWrap: "anywhere", wordBreak: "break-word" }}>
      <div className="no-print mx-auto mb-4 flex max-w-[820px] items-center justify-between px-4">
        <Button variant="outline" onClick={() => window.close()}><X className="h-4 w-4" /> Cerrar</Button>
        <Button className="bg-brand-gradient text-white" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Imprimir / Guardar PDF
        </Button>
      </div>

      <div className="mx-auto max-w-[820px] bg-white px-4 print:max-w-none print:px-0">
        <div style={{ padding: 24 }} className="print:p-2">
          {/* Membrete */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: `2px solid ${ACCENT}`, paddingBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Image src="/brand/logo.jpeg" alt="Valmedic" width={240} height={104} style={{ height: 72, width: "auto", objectFit: "contain" }} />
              <div style={{ fontSize: 11, color: "#6b6168" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#2c2c2a" }}>Policlínico Valmedic</div>
                <div>Servicio de {r.categoria === "Laboratorio" ? "Laboratorio Clínico" : "Ecografía e Imágenes"}</div>
                <div>RUC 20601234567</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: ACCENT }}>Informe de resultado</div>
              <div style={{ fontSize: 12, color: "#8a8088" }}>N° {String(r.id).padStart(6, "0")} · {formatDateLong(r.fechaResultado)}</div>
            </div>
          </div>

          {/* Cabecera del paciente */}
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: "6px 18px", border: "1px solid #e6e1e4", borderRadius: 6, padding: 10 }}>
            <HeadField label="Paciente" value={nombre} />
            <HeadField label="Documento" value={`${p?.tipoDoc ?? ""} ${p?.numDoc ?? ""}`.trim()} />
            {edad != null && <HeadField label="Edad" value={`${edad} años`} />}
            {p?.sexo && <HeadField label="Sexo" value={p.sexo} />}
            <HeadField label="Examen" value={r.nombre} />
            {r.atencion && <HeadField label="Indicación" value={`${r.atencion.origenTipo ?? ""}${r.atencion.origenValor ? ` · ${r.atencion.origenValor}` : ""}`} />}
          </div>

          {/* Título del estudio */}
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 15, fontWeight: 700, textTransform: "uppercase", color: ACCENT }}>
            {r.nombre}
          </div>

          {/* Cuerpo del informe */}
          <div
            style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55 }}
            className="[&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-[14px] [&_h3]:font-bold [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: r.informeHtml ?? "" }}
          />

          {/* Firma */}
          <div style={{ marginTop: 48, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ textAlign: "center", minWidth: 240 }}>
              <div style={{ borderTop: "1px solid #2c2c2a", paddingTop: 4, fontSize: 12 }}>
                <div style={{ fontWeight: 600 }}>{medico || " "}</div>
                {r.profesional?.cmp && <div style={{ color: "#6b6168" }}>C.M.P. {r.profesional.cmp}</div>}
                <div style={{ color: "#8a8088", fontSize: 11 }}>Médico responsable</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, textAlign: "center", fontSize: 10, color: "#a39aa0" }}>
            La ecografía y las pruebas rápidas son métodos de ayuda al diagnóstico, no concluyentes. Correlacionar con la clínica.
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 12mm; size: A4; }
          html, body { background: #fff !important; }
        }
      `}</style>
    </div>
  );
}
