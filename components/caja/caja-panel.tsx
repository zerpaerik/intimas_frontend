"use client";

import * as React from "react";
import { toast } from "sonner";
import { Calculator, Loader2, Lock, LockOpen, Scale, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatPEN } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiItem } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/store";
import { METODOS_CAJA, type CajaActual, type CajaResumen } from "@/lib/api/caja";

const METODO_COLOR: Record<string, string> = { Efectivo: "#16a34a", Yape: "#e6007e", Tarjeta: "#0091d5", Depósito: "#7c3aed" };
const n = (x: unknown) => Number(x ?? 0);
function horaFecha(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function CajaPanel() {
  const sedeId = useAuth((s) => s.session?.sedeId);
  const { data, loading, refetch } = useApiItem<CajaActual>("/caja/actual");
  const [montoInicial, setMontoInicial] = React.useState("");
  const [obsApertura, setObsApertura] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [cerrarOpen, setCerrarOpen] = React.useState(false);

  async function abrir() {
    setSaving(true);
    try {
      await api.post("/caja/abrir", { montoInicial: Number(montoInicial) || 0, sedeId, observacion: obsApertura || undefined });
      toast.success("Caja abierta. Ya puedes registrar operaciones.");
      setMontoInicial(""); setObsApertura("");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo abrir la caja");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton className="h-72 w-full rounded-2xl" />;

  const caja = data?.caja;

  // ─── Sin caja abierta → abrir ───
  if (!caja) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2"><LockOpen className="h-4 w-4 text-brand" /> Abrir caja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <p className="text-sm text-muted-foreground">
            No tienes una caja abierta. Ábrela para registrar atenciones, cobros y gastos.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="monto">Monto inicial / fondo (S/)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">S/</span>
              <Input id="monto" type="number" inputMode="decimal" value={montoInicial} onChange={(e) => setMontoInicial(e.target.value)} placeholder="0.00" className="pl-8" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="obs">Observación (opcional)</Label>
            <Input id="obs" value={obsApertura} onChange={(e) => setObsApertura(e.target.value)} placeholder="Apertura de turno…" />
          </div>
          <Button className="w-full bg-brand-gradient text-white" onClick={abrir} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockOpen className="h-4 w-4" />} Abrir caja
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Caja abierta → estado en vivo + cerrar ───
  const r = data?.resumen;
  return (
    <div className="space-y-4">
      <Card className="border-2 border-brand/30">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white"><Wallet className="h-5 w-5" /></span>
            <div>
              <p className="font-heading font-bold">Caja abierta</p>
              <p className="text-sm text-muted-foreground">
                Desde {horaFecha(caja.fechaApertura)} · Fondo {formatPEN(n(caja.montoInicial))}
                {caja.usuario && ` · ${caja.usuario.nombre}`}
              </p>
            </div>
          </div>
          <Button className="bg-brand-gradient text-white" onClick={() => setCerrarOpen(true)}>
            <Lock className="h-4 w-4" /> Cerrar caja
          </Button>
        </CardContent>
      </Card>

      {r && <ResumenCols r={r} />}

      <p className="text-center text-xs text-muted-foreground">
        {data?.cantidadPagos ?? 0} pago(s) · {data?.cantidadGastos ?? 0} gasto(s) en este turno
      </p>

      {r && (
        <CerrarDialog
          open={cerrarOpen}
          onOpenChange={setCerrarOpen}
          cajaId={caja.id}
          resumen={r}
          onDone={() => { setCerrarOpen(false); refetch(); }}
        />
      )}
    </div>
  );
}

function ResumenCols({ r }: { r: CajaResumen }) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2 text-success"><TrendingUp className="h-4 w-4" /> Ingresos</CardTitle></CardHeader>
        <CardContent className="pt-4">
          <p className="font-heading text-2xl font-bold text-success">{formatPEN(r.totalIngresos)}</p>
          <ul className="mt-3 space-y-2">
            {METODOS_CAJA.map((m) => (
              <li key={m} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: METODO_COLOR[m] }} />
                <span className="text-muted-foreground">{m}</span>
                <span className="ml-auto font-medium tabular-nums">{formatPEN(r.ingresos[m] ?? 0)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2 text-destructive"><TrendingDown className="h-4 w-4" /> Gastos</CardTitle></CardHeader>
        <CardContent className="pt-4">
          <p className="font-heading text-2xl font-bold text-destructive">{formatPEN(r.totalGastos)}</p>
          <ul className="mt-3 space-y-2">
            {METODOS_CAJA.map((m) => (
              <li key={m} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: METODO_COLOR[m] }} />
                <span className="text-muted-foreground">{m}</span>
                <span className="ml-auto font-medium tabular-nums">{formatPEN(r.gastos[m] ?? 0)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="border-2 border-brand/30">
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Scale className="h-4 w-4 text-brand" /> Esperado en caja</CardTitle></CardHeader>
        <CardContent className="pt-4">
          <p className="font-heading text-2xl font-bold">{formatPEN(METODOS_CAJA.reduce((s, m) => s + (r.esperado[m] ?? 0), 0))}</p>
          <ul className="mt-3 space-y-2">
            {METODOS_CAJA.map((m) => (
              <li key={m} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{m}</span>
                <span className="ml-auto font-medium tabular-nums">{formatPEN(r.esperado[m] ?? 0)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Fondo {formatPEN(r.montoInicial)} + ingresos − gastos por método.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function CerrarDialog({ open, onOpenChange, cajaId, resumen, onDone }: {
  open: boolean; onOpenChange: (o: boolean) => void; cajaId: number; resumen: CajaResumen; onDone: () => void;
}) {
  const [contado, setContado] = React.useState<Record<string, string>>({});
  const [obs, setObs] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Pre-cargar lo esperado al abrir el diálogo (editable según conteo real).
  React.useEffect(() => {
    if (open) {
      setContado(Object.fromEntries(METODOS_CAJA.map((m) => [m, String(resumen.esperado[m] ?? 0)])));
      setObs("");
    }
  }, [open, resumen]);

  const totalDif = METODOS_CAJA.reduce((s, m) => s + (Number(contado[m] || 0) - (resumen.esperado[m] ?? 0)), 0);

  async function cerrar() {
    setSaving(true);
    try {
      const arqueo = Object.fromEntries(METODOS_CAJA.map((m) => [m, Number(contado[m] || 0)]));
      await api.post(`/caja/${cajaId}/cerrar`, { arqueo, observacion: obs || undefined });
      toast.success("Caja cerrada. El cierre quedó registrado.");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cerrar la caja");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Calculator className="h-4 w-4 text-brand" /> Arqueo y cierre de caja</DialogTitle>
          <DialogDescription>Declara lo contado por método. La diferencia se calcula contra lo esperado.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-1 text-xs text-muted-foreground">
            <span>Método</span><span className="w-28 text-right">Esperado</span><span className="w-28 text-right">Contado</span>
          </div>
          {METODOS_CAJA.map((m) => {
            const esp = resumen.esperado[m] ?? 0;
            const dif = Number(contado[m] || 0) - esp;
            return (
              <div key={m} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                <span className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: METODO_COLOR[m] }} />{m}
                </span>
                <span className="w-28 text-right text-sm tabular-nums text-muted-foreground">{formatPEN(esp)}</span>
                <div className="w-28">
                  <Input type="number" inputMode="decimal" value={contado[m] ?? ""} onChange={(e) => setContado((c) => ({ ...c, [m]: e.target.value }))} className="h-9 text-right" />
                  {Math.abs(dif) > 0.001 && (
                    <span className={cn("block text-right text-[11px]", dif > 0 ? "text-amber-600" : "text-destructive")}>
                      {dif > 0 ? "+" : ""}{formatPEN(dif)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-between border-t pt-2 text-sm">
            <span className="font-semibold">Diferencia total</span>
            <span className={cn("font-bold tabular-nums", Math.abs(totalDif) < 0.001 ? "text-success" : totalDif > 0 ? "text-amber-600" : "text-destructive")}>
              {totalDif > 0 ? "+" : ""}{formatPEN(totalDif)}
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="obscierre" className="text-xs text-muted-foreground">Observación (opcional)</Label>
            <Input id="obscierre" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Notas del cierre…" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-brand-gradient text-white" onClick={cerrar} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Cerrar caja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
