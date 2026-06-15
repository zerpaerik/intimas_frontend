import { Comprobante } from "@/components/comprobante/comprobante";

export default async function ComprobantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Comprobante id={Number(id)} />;
}
