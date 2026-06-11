import { ResourceDetail } from "@/components/resources/resource-detail";

export default async function UsuarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResourceDetail resourceKey="usuarios" id={Number(id)} />;
}
