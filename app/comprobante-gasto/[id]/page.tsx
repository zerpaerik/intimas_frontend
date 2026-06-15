import { ComprobanteGasto } from "@/components/comprobante/comprobante-gasto";

export default async function ComprobanteGastoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ComprobanteGasto id={Number(id)} />;
}
