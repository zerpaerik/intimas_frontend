"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Ban, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, HandCoins, Loader2, Plus, Stethoscope, XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatPEN } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiList } from "@/lib/api/hooks";
import { useSedeFiltro } from "@/lib/auth/store";
import { METODOS_PAGO } from "@/lib/api/atenciones";
import { type Cita, CITA_ESTADO_COLOR } from "@/lib/api/citas";
import type { Row } from "@/lib/resources/types";

const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function ymd(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function EstadoBadge({ estado }: { estado: string }) {
  const c = CITA_ESTADO_COLOR[estado] ?? "#64748b";
  return (
    <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `color-mix(in srgb, ${c} 15%, transparent)`, color: c }}>
      {estado}
    </span>
  );
}

export function CitasView() {
  const sedeId = useSedeFiltro();
  const today = React.useMemo(() => ymd(new Date()), []);
  const [cursor, setCursor] = React.useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = React.useState(today);
  const [medicoId, setMedicoId] = React.useState("all");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = React.useMemo(() => new Date(year, month, 1), [year, month]);
  const last = React.useMemo(() => new Date(year, month + 1, 0), [year, month]);

  const usuarios = useApiList<Row>("/usuarios");
  const medicos = usuarios.data.filter((u) => Number(u.roleId) === 10);

  const path =
    `/citas?desde=${ymd(first)}&hasta=${ymd(last)}` +
    (sedeId ? `&sedeId=${sedeId}` : "") +
    (medicoId !== "all" ? `&medicoId=${medicoId}` : "");
  const { data: citas, loading, refetch } = useApiList<Cita>(path);

  const byDay = React.useMemo(() => {
    const m = new Map<string, Cita[]>();
    for (const c of citas) {
      const k = String(c.fecha).slice(0, 10);
      const arr = m.get(k);
      if (arr) arr.push(c); else m.set(k, [c]);
    }
    return m;
  }, [citas]);

  const cells = React.useMemo(() => {
    const startDow = (first.getDay() + 6) % 7; // Lunes = 0
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) arr.push(null);
    for (let d = 1; d <= last.getDate(); d++) arr.push(new Date(year, month, d));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [first, last, year, month]);

  const selCitas = byDay.get(selected) ?? [];
  const monthLabel = cursor.toLocaleDateString("es-PE", { month: "long", year: "numeric" });

  const [abonoTarget, setAbonoTarget] = React.useState<Cita | null>(null);
  const [abonoMonto, setAbonoMonto] = React.useState("");
  const [abonoMetodo, setAbonoMetodo] = React.useState("Efectivo");

  async function marcar(c: Cita, estado: string) {
    try { await api.post(`/citas/${c.id}/estado`, { estado }); refetch(); } catch { /* noop */ }
  }
  function abrirCobro(c: Cita) {
    setAbonoTarget(c);
    setAbonoMonto(String(Math.max(0, Number(c.monto) - Number(c.pagado ?? 0))));
    setAbonoMetodo(c.metodoPago || "Efectivo");
  }
  async function registrarAbono() {
    if (!abonoTarget) return;
    try {
      await api.post(`/citas/${abonoTarget.id}/abono`, { monto: Number(abonoMonto) || 0, metodoPago: abonoMetodo });
      toast.success("Abono registrado");
      setAbonoTarget(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo registrar el abono");
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">Agenda <span className="px-1">›</span><span className="text-foreground">Citas</span></p>
      <PageHeader
        title="Citas"
        description="Agenda de citas por profesional. Márcalas como asistió, no asistió o cancelada."
        actions={<Button asChild className="bg-brand-gradient text-white"><Link href="/citas/nueva"><Plus className="h-4 w-4" /> Nueva cita</Link></Button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="min-w-[10rem] text-center font-heading text-base font-bold capitalize">{monthLabel}</div>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" className="h-9" onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); setSelected(ymd(d)); }}>Hoy</Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <Select value={medicoId} onValueChange={setMedicoId}>
            <SelectTrigger className="h-9 w-52"><SelectValue placeholder="Todos los médicos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los médicos</SelectItem>
              {medicos.map((m) => <SelectItem key={m.id} value={String(m.id)}>{String(m.nombre)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_minmax(0,1fr)]">
        {/* Calendario */}
        <div className="rounded-2xl border bg-card p-3">
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase text-muted-foreground">
            {DOW.map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="min-h-[4.5rem] rounded-lg" />;
              const key = ymd(d);
              const dayCitas = byDay.get(key) ?? [];
              const isSel = key === selected;
              const isToday = key === today;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={cn(
                    "min-h-[4.5rem] rounded-lg border p-1 text-left align-top transition-colors hover:bg-accent/50",
                    isSel ? "border-brand ring-1 ring-brand" : "border-transparent",
                    isToday && !isSel && "bg-brand/5",
                  )}
                >
                  <div className={cn("mb-0.5 text-xs font-semibold", isToday && "text-brand")}>{d.getDate()}</div>
                  <div className="space-y-0.5">
                    {dayCitas.slice(0, 3).map((c) => (
                      <div key={c.id} className="flex items-center gap-1 truncate rounded px-1 text-[10px]" style={{ backgroundColor: `color-mix(in srgb, ${CITA_ESTADO_COLOR[c.estado] ?? "#64748b"} 14%, transparent)` }}>
                        <span className="tabular-nums text-muted-foreground">{c.hora}</span>
                        <span className="truncate">{c.paciente?.nombres ?? ""}</span>
                      </div>
                    ))}
                    {dayCitas.length > 3 && <div className="px-1 text-[10px] text-muted-foreground">+{dayCitas.length - 3} más</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Día seleccionado */}
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b p-3">
            <p className="flex items-center gap-2 text-sm font-semibold capitalize">
              <CalendarDays className="h-4 w-4 text-brand" />
              {new Date(`${selected}T00:00:00`).toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long" })}
            </p>
            <span className="text-xs text-muted-foreground">{selCitas.length} cita{selCitas.length === 1 ? "" : "s"}</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando…</div>
          ) : selCitas.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No hay citas este día.</div>
          ) : (
            <div className="divide-y">
              {selCitas.map((c) => {
                const saldo = Number(c.monto) - Number(c.pagado ?? 0);
                const pendiente = saldo > 0.001;
                const cerrada = c.estado === "Asistió" || c.estado === "No asistió" || c.estado === "Cancelada";
                return (
                  <div key={c.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tabular-nums">{c.hora}</span>
                          <EstadoBadge estado={c.estado} />
                        </div>
                        <div className="truncate font-medium">{c.paciente?.nombres} {c.paciente?.apellidos}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.medico?.nombre ? `Dr(a). ${c.medico.nombre}` : "—"}{c.motivo ? ` · ${c.motivo}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        {Number(c.monto) > 0 && <div className="text-sm font-medium tabular-nums">{formatPEN(Number(c.monto))}</div>}
                        {pendiente ? (
                          <span className="text-[11px] font-medium text-destructive">Saldo {formatPEN(saldo)}</span>
                        ) : Number(c.monto) > 0 ? (
                          <span className="text-[11px] font-medium text-success">Pagada</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {!cerrada && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 text-success" onClick={() => marcar(c, "Asistió")}><CheckCircle2 className="h-3.5 w-3.5" /> Asistió</Button>
                          <Button size="sm" variant="outline" className="h-7 text-destructive" onClick={() => marcar(c, "No asistió")}><XCircle className="h-3.5 w-3.5" /> No asistió</Button>
                          <Button size="sm" variant="outline" className="h-7 text-muted-foreground" onClick={() => marcar(c, "Cancelada")}><Ban className="h-3.5 w-3.5" /> Cancelar</Button>
                        </>
                      )}
                      {pendiente && <Button size="sm" className="h-7 bg-brand-gradient text-white" onClick={() => abrirCobro(c)}><HandCoins className="h-3.5 w-3.5" /> Cobrar</Button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!abonoTarget} onOpenChange={(o) => !o && setAbonoTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar abono</DialogTitle></DialogHeader>
          {abonoTarget && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {abonoTarget.paciente?.nombres} {abonoTarget.paciente?.apellidos} · Monto {formatPEN(Number(abonoTarget.monto))} · Abonado {formatPEN(Number(abonoTarget.pagado ?? 0))}
              </p>
              <div className="space-y-1.5">
                <Label>Monto a abonar (S/)</Label>
                <Input type="number" value={abonoMonto} onChange={(e) => setAbonoMonto(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Método</Label>
                <Select value={abonoMetodo} onValueChange={setAbonoMetodo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{METODOS_PAGO.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAbonoTarget(null)}>Cancelar</Button>
            <Button className="bg-brand-gradient text-white" onClick={registrarAbono}>Registrar abono</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
