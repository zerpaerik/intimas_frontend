import { AtencionDetail } from "@/components/atenciones/atencion-detail";

export default async function AtencionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AtencionDetail id={Number(id)} />;
}
