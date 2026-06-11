import { ResourceForm } from "@/components/resources/resource-form";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResourceForm resourceKey="usuarios" mode="edit" id={Number(id)} />;
}
