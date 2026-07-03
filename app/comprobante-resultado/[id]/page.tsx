import { ComprobanteResultado } from "@/components/comprobante/comprobante-resultado";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ComprobanteResultado id={Number(id)} />;
}
