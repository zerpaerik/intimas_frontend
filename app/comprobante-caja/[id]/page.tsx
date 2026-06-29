import { ComprobanteCaja } from "@/components/comprobante/comprobante-caja";

export default async function ComprobanteCajaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ComprobanteCaja id={Number(id)} />;
}
