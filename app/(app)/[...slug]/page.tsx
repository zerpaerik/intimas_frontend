import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { findNavItem, groupLabelForHref } from "@/lib/nav";

export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const href = "/" + (slug ?? []).join("/");
  const item = findNavItem(href);
  const group = groupLabelForHref(href);
  const title = item?.label ?? "Módulo";

  return (
    <div>
      <PageHeader
        title={title}
        description={group ? `${group} · Vista previa` : "Vista previa"}
      />
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/40 px-6 py-20 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient-soft ring-1 ring-brand/15">
          <Construction className="h-8 w-8 text-brand" />
        </div>
        <h2 className="font-heading text-xl font-bold">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Este módulo forma parte de la propuesta y se desarrollará en la
          siguiente fase. Por ahora puedes explorar el{" "}
          <strong className="text-foreground">Dashboard</strong> y toda la
          sección <strong className="text-foreground">Archivos</strong>, que
          están completamente funcionales.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
