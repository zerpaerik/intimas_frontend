import { AtenderConsulta } from "@/components/consultas/atender-consulta";

export default async function AtenderConsultaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AtenderConsulta id={Number(id)} />;
}
