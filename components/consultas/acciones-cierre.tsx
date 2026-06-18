"use client";

import { CheckCircle2, Loader2, Lock, LockOpen, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/store";
import { formatDateLong } from "@/lib/format";

/**
 * Barra de acciones con cierre de registro clínico.
 * - Abierto: "Guardar" (queda editable) y "Guardar y cerrar" (bloquea).
 * - Cerrado: banner de solo lectura + "Reabrir" únicamente para Administrador (roleId 1).
 */
export function AccionesCierre({
  cerrada,
  fechaCierre,
  saving,
  onGuardar,
  onReabrir,
  onCancel,
}: {
  cerrada: boolean;
  fechaCierre?: string | null;
  saving: boolean;
  onGuardar: (cerrar: boolean) => void;
  onReabrir: () => void;
  onCancel: () => void;
}) {
  const isAdmin = useAuth((s) => s.session?.roleId === 1);

  if (cerrada) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
        <span className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          <Lock className="h-4 w-4" />
          Registro cerrado{fechaCierre ? ` el ${formatDateLong(fechaCierre)}` : ""} · solo lectura
        </span>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={onReabrir} className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-300">
            <LockOpen className="h-4 w-4" /> Reabrir (admin)
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button variant="outline" onClick={onCancel}>Cancelar</Button>
      <Button variant="outline" onClick={() => onGuardar(false)} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
      </Button>
      <Button className="bg-brand-gradient text-white" onClick={() => onGuardar(true)} disabled={saving}>
        <CheckCircle2 className="h-4 w-4" /> Guardar y cerrar
      </Button>
    </div>
  );
}
