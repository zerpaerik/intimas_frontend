import { ComprobanteControl } from "@/components/comprobante/comprobante-control";

export default async function ComprobanteControlPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ComprobanteControl id={Number(id)} />;
}
