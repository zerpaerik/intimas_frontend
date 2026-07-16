import { ReportePdf } from "@/components/reportes/reporte-pdf";
import { ReportePdfProduccion } from "@/components/reportes/reporte-pdf-produccion";

export default async function ReportePdfPage({
  params,
  searchParams,
}: {
  params: Promise<{ tipo: string }>;
  searchParams: Promise<{ desde?: string; hasta?: string; sedeId?: string }>;
}) {
  const { tipo } = await params;
  const sp = await searchParams;
  if (tipo === "por-servicio" || tipo === "por-profesional") {
    return <ReportePdfProduccion tipo={tipo} desde={sp.desde} hasta={sp.hasta} sedeId={sp.sedeId} />;
  }
  return <ReportePdf tipo={tipo} desde={sp.desde} hasta={sp.hasta} sedeId={sp.sedeId} />;
}
