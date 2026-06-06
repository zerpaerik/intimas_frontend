import { ResourceDetail } from "@/components/resources/resource-detail";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  return <ResourceDetail resourceKey={resource} id={Number(id)} />;
}
