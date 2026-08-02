"use client";

import * as React from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api/client";

export function CambiarContrasena() {
  const [actual, setActual] = React.useState("");
  const [nueva, setNueva] = React.useState("");
  const [confirmar, setConfirmar] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function guardar() {
    if (!actual || !nueva) return toast.error("Completa la contraseña actual y la nueva.");
    if (nueva.length < 4) return toast.error("La nueva contraseña debe tener al menos 4 caracteres.");
    if (nueva !== confirmar) return toast.error("La confirmación no coincide.");
    setSaving(true);
    try {
      await api.post("/auth/change-password", { actual, nueva });
      toast.success("Contraseña actualizada.");
      setActual("");
      setNueva("");
      setConfirmar("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cambiar la contraseña");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-2 text-sm text-muted-foreground">
        Administrativo <span className="px-1">›</span>
        <span className="text-foreground">Cambiar contraseña</span>
      </p>
      <PageHeader title="Cambiar contraseña" description="Actualiza la contraseña de tu propia cuenta." />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="actual">Contraseña actual</Label>
            <Input id="actual" type="password" value={actual} onChange={(e) => setActual(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nueva">Nueva contraseña</Label>
            <Input id="nueva" type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
            <p className="text-xs text-muted-foreground">Mínimo 4 caracteres.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmar">Confirmar nueva contraseña</Label>
            <Input
              id="confirmar"
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") guardar(); }}
            />
          </div>
          <Button className="w-full bg-brand-gradient text-white" onClick={guardar} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Cambiar contraseña
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
