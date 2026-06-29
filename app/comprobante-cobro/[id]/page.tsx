import { ComprobanteCobro } from "@/components/comprobante/comprobante-cobro";

export default async function ComprobanteCobroPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pago?: string }>;
}) {
  const { id } = await params;
  const { pago } = await searchParams;
  return <ComprobanteCobro atencionId={Number(id)} pagoId={pago ? Number(pago) : undefined} />;
}
