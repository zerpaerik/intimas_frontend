import { AtencionRegistro } from "@/components/atenciones/atencion-registro";

export default async function NuevaAtencionPage({
  searchParams,
}: {
  searchParams: Promise<{ citaId?: string }>;
}) {
  const { citaId } = await searchParams;
  return <AtencionRegistro citaId={citaId ? Number(citaId) : undefined} />;
}
