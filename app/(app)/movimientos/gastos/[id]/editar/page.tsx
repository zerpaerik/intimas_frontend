import { GastoForm } from "@/components/gastos/gasto-form";

export default async function EditarGastoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GastoForm gastoId={Number(id)} />;
}
