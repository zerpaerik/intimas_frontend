import { ReportePdf } from "@/components/reportes/reporte-pdf";

export default async function ReportePdfPage({
  params,
  searchParams,
}: {
  params: Promise<{ tipo: string }>;
  searchParams: Promise<{ desde?: string; hasta?: string; sedeId?: string }>;
}) {
  const { tipo } = await params;
  const sp = await searchParams;
  return <ReportePdf tipo={tipo} desde={sp.desde} hasta={sp.hasta} sedeId={sp.sedeId} />;
}
