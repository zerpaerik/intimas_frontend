import { ComprobantePediatria } from "@/components/comprobante/comprobante-pediatria";

export default async function ComprobantePediatriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ComprobantePediatria id={Number(id)} />;
}
