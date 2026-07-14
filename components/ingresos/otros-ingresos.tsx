"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, Banknote, CalendarDays, Check, Loader2, Plus, Trash2, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatPEN } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiItem, useApiList } from "@/lib/api/hooks";
import { METODOS_PAGO } from "@/lib/api/atenciones";
import { type CajaActual } from "@/lib/api/caja";
import { useAuth, useSedeFiltro } from "@/lib/auth/store";
import { type OtroIngreso } from "@/lib/api/otros-ingresos";

function iso(d: Date = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function NuevoIngreso({ onDone, sinCaja }: { onDone: () => void; sinCaja: boolean }) {
  const sedeId = useAuth((s) => s.session?.sedeId);
  const [concepto, setConcepto] = React.useState("");
  const [monto, setMonto] = React.useState("");
  const [metodo, setMetodo] = React.useState("Efectivo");
  const [fecha, setFecha] = React.useState(iso);
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!concepto.trim()) return toast.error("Indica el concepto del ingreso.");
    const m = Number(monto);
    if (!m || m <= 0) return toast.error("Ingresa un monto válido.");
    setSaving(true);
    try {
      await api.post("/otros-ingresos", { concepto: concepto.trim(), monto: m, metodo, fecha, sedeId });
      toast.success("Ingreso registrado");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo registrar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {sinCaja && (
        <p className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Necesitas una caja abierta para registrar el ingreso. <a href="/caja" className="font-medium underline">Abrir caja</a>
        </p>
      )}
      <div className="space-y-1.5">
        <Label>Concepto *</Label>
        <Input value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Ej. Venta de ecografía impresa, alquiler de equipo…" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Monto *</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">S/</span>
            <Input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} className="pl-7" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Método</Label>
          <Select value={metodo} onValueChange={setMetodo}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {METODOS_PAGO.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Fecha</Label>
        <Input type="date" value={fecha} max={iso()} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <Button className="w-full bg-brand-gradient text-white" onClick={submit} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {saving ? "Guardando…" : "Registrar ingreso"}
      </Button>
    </div>
  );
}

export function OtrosIngresos() {
  const sedeId = useSedeFiltro();
  const [open, setOpen] = React.useState(false);
  const [desde, setDesde] = React.useState(iso);
  const [hasta, setHasta] = React.useState(iso);
  const [pendingAnular, setPendingAnular] = React.useState<OtroIngreso | null>(null);
  const [anulando, setAnulando] = React.useState(false);

  const { data: cajaData } = useApiItem<CajaActual>("/caja/actual");
  const sinCaja = !!cajaData && !cajaData.caja;

  const path =
    `/otros-ingresos?` +
    [desde && `desde=${desde}`, hasta && `hasta=${hasta}`, sedeId && `sedeId=${sedeId}`].filter(Boolean).join("&");
  const { data: rows, loading, error, refetch } = useApiList<OtroIngreso>(path);

  const total = rows.filter((r) => !r.anulado).reduce((s, r) => s + Number(r.monto), 0);
  const isHoy = desde === iso() && hasta === iso();

  async function confirmAnular() {
    if (!pendingAnular) return;
    setAnulando(true);
    try {
      await api.post(`/otros-ingresos/${pendingAnular.id}/anular`, {});
      toast.success("Ingreso anulado");
      setPendingAnular(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo anular");
    } finally {
      setAnulando(false);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Movimientos <span className="px-1">›</span>
        <span className="text-foreground">Otros Ingresos</span>
      </p>
      <PageHeader
        title="Otros Ingresos"
        description="Ingresos que no vienen de una atención (cuentan en caja y reportes)."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-gradient text-white"><Plus className="h-4 w-4" /> Nuevo ingreso</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Banknote className="h-5 w-5 text-brand" /> Registrar otro ingreso</DialogTitle>
                <DialogDescription>Se suma a la caja abierta y a los reportes del día.</DialogDescription>
              </DialogHeader>
              <NuevoIngreso sinCaja={sinCaja} onDone={() => { setOpen(false); refetch(); }} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="rounded-2xl border bg-card">
        <div className="flex flex-wrap items-end gap-3 border-b p-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Desde</Label>
            <Input type="date" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} className="h-9 w-[9.5rem]" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hasta</Label>
            <Input type="date" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} className="h-9 w-[9.5rem]" />
          </div>
          <Button variant={isHoy ? "default" : "outline"} size="sm" className={cn("h-9", isHoy && "bg-brand text-white hover:bg-brand/90")} onClick={() => { setDesde(iso()); setHasta(iso()); }}>
            <CalendarDays className="h-4 w-4" /> Hoy
          </Button>
          <span className="ml-auto text-sm text-muted-foreground">Total: <b className="text-foreground">{formatPEN(total)}</b></span>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <TriangleAlert className="h-6 w-6 text-destructive" />
            No se pudo cargar la información.
            <Button variant="outline" size="sm" onClick={refetch} className="mt-1">Reintentar</Button>
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No hay otros ingresos en este rango.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Fecha</TableHead>
                <TableHead className="text-xs">Concepto</TableHead>
                <TableHead className="text-xs">Método</TableHead>
                <TableHead className="text-right text-xs">Monto</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className={cn(r.anulado && "opacity-55")}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(r.fecha))}</TableCell>
                  <TableCell className={cn("font-medium", r.anulado && "line-through")}>{r.concepto || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{r.metodo}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatPEN(Number(r.monto))}</TableCell>
                  <TableCell className="text-right">
                    {!r.anulado && (
                      <Button size="icon-sm" variant="ghost" title="Anular" onClick={() => setPendingAnular(r)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={!!pendingAnular} onOpenChange={(o) => !o && setPendingAnular(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular este ingreso?</AlertDialogTitle>
            <AlertDialogDescription>
              Se anulará <b>{pendingAnular?.concepto}</b> ({formatPEN(Number(pendingAnular?.monto ?? 0))}). Dejará de sumar en caja y reportes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmAnular(); }} disabled={anulando} className="bg-destructive text-white hover:bg-destructive/90">
              {anulando ? "Anulando…" : "Anular"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
