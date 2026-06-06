import { ResourceList } from "@/components/resources/resource-list";

export default async function ResourceListPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <ResourceList resourceKey={resource} />;
}
