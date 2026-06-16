import { ComprobanteHistoria } from "@/components/comprobante/comprobante-historia";

export default async function ComprobanteHistoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ComprobanteHistoria id={Number(id)} />;
}
