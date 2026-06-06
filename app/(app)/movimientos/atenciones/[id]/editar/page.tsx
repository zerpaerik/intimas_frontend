import { AtencionRegistro } from "@/components/atenciones/atencion-registro";

export default async function EditarAtencionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AtencionRegistro atencionId={Number(id)} />;
}
