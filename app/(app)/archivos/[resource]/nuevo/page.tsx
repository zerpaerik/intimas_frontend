import { ResourceForm } from "@/components/resources/resource-form";

export default async function ResourceCreatePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <ResourceForm resourceKey={resource} mode="create" />;
}
