"use client";

import * as React from "react";
import { toast } from "sonner";
import { HandCoins, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatPEN } from "@/lib/format";
import { api } from "@/lib/api/client";
import { METODOS_PAGO, type Atencion } from "@/lib/api/atenciones";

/** Diálogo para registrar un cobro (abono) sobre el saldo de una atención. */
export function CobroDialog({
  open, onOpenChange, atencionId, saldo, paciente, onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  atencionId: number;
  saldo: number;
  paciente?: string;
  onDone?: (a: Atencion) => void;
}) {
  const [monto, setMonto] = React.useState("");
  const [metodo, setMetodo] = React.useState("Efectivo");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) { setMonto(String(saldo)); setMetodo("Efectivo"); }
  }, [open, saldo]);

  async function submit() {
    const m = Number(monto);
    if (!m || m <= 0) return toast.error("Ingresa un monto válido.");
    if (m > saldo + 0.001) return toast.error(`El monto supera el saldo (${formatPEN(saldo)}).`);
    setSaving(true);
    try {
      const a = await api.post<Atencion>(`/atenciones/${atencionId}/pagos`, { monto: m, metodo });
      toast.success(`Cobro registrado · ${formatPEN(m)}`);
      onOpenChange(false);
      onDone?.(a);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo registrar el cobro");
    } finally {
      setSaving(false);
    }
  }

  const mitad = Math.round((saldo / 2) * 100) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-4 w-4 text-brand" /> Registrar cobro
          </DialogTitle>
          <DialogDescription>
            {paciente ? `${paciente} · ` : ""}Saldo pendiente:{" "}
            <strong className="text-foreground">{formatPEN(saldo)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Monto a cobrar</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">S/</span>
              <Input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} className="pl-7" autoFocus />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Método</Label>
            <Select value={metodo} onValueChange={setMetodo}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {METODOS_PAGO.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setMonto(String(saldo))} className="rounded-md border px-2 py-1 text-xs hover:bg-accent/50">
            Saldo total · {formatPEN(saldo)}
          </button>
          {mitad > 0 && mitad < saldo && (
            <button type="button" onClick={() => setMonto(String(mitad))} className="rounded-md border px-2 py-1 text-xs hover:bg-accent/50">
              Mitad · {formatPEN(mitad)}
            </button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-brand-gradient text-white" onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandCoins className="h-4 w-4" />} Cobrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
