import { InformeEditor } from "@/components/resultados/informe-editor";

export default async function Page({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  return <InformeEditor itemId={Number(itemId)} />;
}
