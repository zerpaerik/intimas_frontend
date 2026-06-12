"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Receipt } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api/client";
import { useApiItem } from "@/lib/api/hooks";
import { METODOS_PAGO } from "@/lib/api/atenciones";
import { CATEGORIAS_GASTO, type Gasto } from "@/lib/api/gastos";
import { useAuth } from "@/lib/auth/store";

function localDate(d: Date = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function Form({ initial }: { initial?: Gasto }) {
  const router = useRouter();
  const sedeId = useAuth((s) => s.session?.sedeId);
  const mode = initial ? "edit" : "create";

  const [descripcion, setDescripcion] = React.useState(initial?.descripcion ?? "");
  const [monto, setMonto] = React.useState(initial ? String(Number(initial.monto)) : "");
  const [categoria, setCategoria] = React.useState(initial?.categoria ?? "");
  const [metodo, setMetodo] = React.useState(initial?.metodo ?? "Efectivo");
  const [proveedor, setProveedor] = React.useState(initial?.proveedor ?? "");
  const [fecha, setFecha] = React.useState(initial ? localDate(new Date(initial.fecha)) : localDate());
  const [saving, setSaving] = React.useState(false);

  async function guardar() {
    if (!descripcion.trim()) return toast.error("Indica una descripción.");
    const m = Number(monto);
    if (!m || m <= 0) return toast.error("Ingresa un monto válido.");
    const payload = {
      descripcion: descripcion.trim(),
      monto: m,
      categoria: categoria || undefined,
      metodo,
      proveedor: proveedor.trim() || undefined,
      fecha,
      sedeId,
    };
    setSaving(true);
    try {
      if (mode === "create") {
        await api.post("/gastos", payload);
        toast.success("Gasto registrado");
      } else if (initial) {
        await api.patch(`/gastos/${initial.id}`, payload);
        toast.success("Gasto actualizado");
      }
      router.push("/movimientos/gastos");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Movimientos <span className="px-1">›</span>
        <button onClick={() => router.push("/movimientos/gastos")} className="hover:text-foreground">Gastos</button>
        <span className="px-1">›</span>
        <span className="text-foreground">{mode === "create" ? "Nuevo" : "Editar"}</span>
      </p>
      <PageHeader
        title={mode === "create" ? "Nuevo gasto" : "Editar gasto"}
        description="Registra un egreso del consultorio."
        actions={
          <Button variant="outline" onClick={() => router.push("/movimientos/gastos")}>
            <ArrowLeft className="h-4 w-4" />Volver
          </Button>
        }
      />

      <div className="max-w-2xl rounded-2xl border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Descripción *</Label>
            <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} placeholder="Ej. Compra de guantes y mascarillas" />
          </div>
          <div className="space-y-1.5">
            <Label>Monto *</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">S/</span>
              <Input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} className="pl-7" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Fecha</Label>
            <Input type="date" value={fecha} max={localDate()} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecciona…" /></SelectTrigger>
              <SelectContent>
                {CATEGORIAS_GASTO.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Método de pago</Label>
            <Select value={metodo} onValueChange={setMetodo}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {METODOS_PAGO.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Proveedor (opcional)</Label>
            <Input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Ej. Distribuidora Médica SAC" />
          </div>
        </div>

        <Button className="mt-5 h-11 w-full bg-brand-gradient text-white" onClick={guardar} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
          {mode === "create" ? "Registrar gasto" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}

export function GastoForm({ gastoId }: { gastoId?: number }) {
  const router = useRouter();
  const { data: existing, loading } = useApiItem<Gasto>(gastoId ? `/gastos/${gastoId}` : null);

  if (gastoId && loading) return <Skeleton className="h-[28rem] w-full rounded-2xl" />;
  if (gastoId && !existing) {
    return (
      <div className="rounded-2xl border border-dashed py-20 text-center text-muted-foreground">
        No se encontró el gasto solicitado.
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/movimientos/gastos")}>Volver</Button>
        </div>
      </div>
    );
  }
  return <Form initial={gastoId ? existing ?? undefined : undefined} />;
}
