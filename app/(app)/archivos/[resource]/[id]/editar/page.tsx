import { ResourceForm } from "@/components/resources/resource-form";

export default async function ResourceEditPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  return <ResourceForm resourceKey={resource} mode="edit" id={Number(id)} />;
}
