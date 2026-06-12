"use client";

import * as React from "react";
import { toast } from "sonner";
import { Ban, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";

/** Diálogo genérico de anulación con motivo obligatorio (atenciones, gastos…). */
export function AnularDialog({
  open, onOpenChange, path, titulo = "Anular registro", descripcion, onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  path: string;
  titulo?: string;
  descripcion?: React.ReactNode;
  onDone?: () => void;
}) {
  const [motivo, setMotivo] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { if (open) setMotivo(""); }, [open]);

  async function submit() {
    const m = motivo.trim();
    if (m.length < 3) return toast.error("Indica el motivo de la anulación.");
    setSaving(true);
    try {
      await api.post(path, { motivo: m });
      toast.success("Registro anulado");
      onOpenChange(false);
      onDone?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo anular");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Ban className="h-4 w-4" /> {titulo}
          </DialogTitle>
          <DialogDescription>
            {descripcion ?? "El registro quedará anulado (no se elimina) y dejará de sumar en caja. Se guardará quién lo anuló y por qué."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Motivo de la anulación *</Label>
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="Ej. registrada por error, duplicada, el paciente no asistió…"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />} Anular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
