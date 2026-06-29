import { PageHeader } from "@/components/page-header";
import { CajaPanel } from "@/components/caja/caja-panel";

export default function CajaPage() {
  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Movimientos <span className="px-1">›</span>
        <span className="text-foreground">Caja</span>
      </p>
      <PageHeader title="Caja" description="Abre tu caja, registra las operaciones del turno y ciérrala con arqueo." />
      <CajaPanel />
    </div>
  );
}
