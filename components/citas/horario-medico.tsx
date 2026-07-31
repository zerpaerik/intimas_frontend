"use client";

import * as React from "react";
import { toast } from "sonner";
import { CalendarClock, ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";
import { useApiList } from "@/lib/api/hooks";
import { SEDES } from "@/lib/auth/roles";
import type { Row } from "@/lib/resources/types";
import type { AgendaBloque } from "@/lib/api/agenda";

const DOW = [
  { i: 1, l: "Lun" }, { i: 2, l: "Mar" }, { i: 3, l: "Mié" }, { i: 4, l: "Jue" },
  { i: 5, l: "Vie" }, { i: 6, l: "Sáb" }, { i: 0, l: "Dom" },
];
function ymd(d: Date) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function nTurnos(b: AgendaBloque) {
  const m = (s: string) => { const [h, mm] = s.split(":").map(Number); return (h || 0) * 60 + (mm || 0); };
  return Math.max(0, Math.floor((m(b.horaFin) - m(b.horaInicio)) / (b.slotMin || 20)));
}

export function HorarioMedico() {
  const usuarios = useApiList<Row>("/usuarios");
  const medicos = usuarios.data.filter((u) => Number(u.roleId) === 10);
  const [medicoId, setMedicoId] = React.useState("");
  const [sedeId, setSedeId] = React.useState("none");
  const [cursor, setCursor] = React.useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const monthLabel = cursor.toLocaleDateString("es-PE", { month: "long", year: "numeric" });

  const { data: bloques, loading, refetch } = useApiList<AgendaBloque>(
    medicoId ? `/agenda?medicoId=${medicoId}&desde=${ymd(first)}&hasta=${ymd(last)}` : null,
  );

  const [dFecha, setDFecha] = React.useState(ymd(new Date()));
  const [hIni, setHIni] = React.useState("08:00");
  const [hFin, setHFin] = React.useState("12:00");
  const [slot, setSlot] = React.useState("20");
  const [dows, setDows] = React.useState<number[]>([]);
  const [saving, setSaving] = React.useState(false);

  async function crear(fechas: string[], okMsg: string) {
    if (!medicoId) return toast.error("Elige el médico.");
    if (!fechas.length) return toast.error("No hay fechas para agregar.");
    setSaving(true);
    try {
      await api.post("/agenda", {
        medicoId: Number(medicoId),
        fechas,
        horaInicio: hIni,
        horaFin: hFin,
        slotMin: Number(slot) || 20,
        sedeId: sedeId !== "none" ? Number(sedeId) : undefined,
      });
      toast.success(okMsg);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  function aplicarPatron() {
    if (dows.length === 0) return toast.error("Elige al menos un día de la semana.");
    const fechas: string[] = [];
    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(year, month, d);
      if (dows.includes(dt.getDay())) fechas.push(ymd(dt));
    }
    crear(fechas, `${fechas.length} día(s) agregados a ${monthLabel}`);
  }

  async function eliminar(id: number) {
    try { await api.del(`/agenda/${id}`); refetch(); } catch { /* noop */ }
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">Agenda <span className="px-1">›</span><span className="text-foreground">Horario médico</span></p>
      <PageHeader title="Horario médico" description="Carga los días y horas que atiende cada médico. Se dividen en turnos automáticamente." />

      <div className="mb-5 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Médico</Label>
          <Select value={medicoId} onValueChange={setMedicoId}>
            <SelectTrigger><SelectValue placeholder="Elige el médico…" /></SelectTrigger>
            <SelectContent>
              {medicos.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No hay médicos (usuarios rol Profesional de salud).</div>}
              {medicos.map((m) => <SelectItem key={m.id} value={String(m.id)}>{String(m.nombre)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Sede (opcional)</Label>
          <Select value={sedeId} onValueChange={setSedeId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Todas / sin sede</SelectItem>
              {SEDES.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Turno (min)</Label>
          <Input type="number" value={slot} onChange={(e) => setSlot(e.target.value)} />
        </div>
      </div>

      {!medicoId ? (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">Elige un médico para cargar su horario.</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Plus className="h-4 w-4 text-brand" /> Día puntual</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5"><Label>Fecha</Label><Input type="date" value={dFecha} onChange={(e) => setDFecha(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Desde</Label><Input type="time" value={hIni} onChange={(e) => setHIni(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Hasta</Label><Input type="time" value={hFin} onChange={(e) => setHFin(e.target.value)} /></div>
              </div>
              <Button className="mt-3 w-full bg-brand-gradient text-white" disabled={saving} onClick={() => crear([dFecha], "Día agregado")}>Agregar día</Button>
            </div>

            <div className="rounded-2xl border bg-card p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><CalendarClock className="h-4 w-4 text-brand" /> Patrón · {monthLabel}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {DOW.map((d) => (
                  <button key={d.i} type="button"
                    onClick={() => setDows((p) => (p.includes(d.i) ? p.filter((x) => x !== d.i) : [...p, d.i]))}
                    className={cn("rounded-lg border px-3 py-1.5 text-sm", dows.includes(d.i) ? "border-brand bg-brand/10 text-brand" : "hover:bg-accent/50")}>
                    {d.l}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Desde</Label><Input type="time" value={hIni} onChange={(e) => setHIni(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Hasta</Label><Input type="time" value={hFin} onChange={(e) => setHFin(e.target.value)} /></div>
              </div>
              <Button className="mt-3 w-full bg-brand-gradient text-white" disabled={saving} onClick={aplicarPatron}>Aplicar al mes</Button>
              <p className="mt-2 text-xs text-muted-foreground">Genera esos días de la semana para todo {monthLabel}.</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b p-3">
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="min-w-[8.5rem] text-center text-sm font-semibold capitalize">{monthLabel}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <span className="text-xs text-muted-foreground">{bloques.length} bloque(s)</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando…</div>
            ) : bloques.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Sin horario cargado este mes.</div>
            ) : (
              <div className="divide-y">
                {bloques.map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-2 p-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium capitalize">{new Date(`${String(b.fecha).slice(0, 10)}T00:00:00`).toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short" })}</div>
                      <div className="text-xs tabular-nums text-muted-foreground">{b.horaInicio}–{b.horaFin} · {nTurnos(b)} turnos de {b.slotMin} min{b.sede ? ` · ${b.sede.nombre}` : ""}</div>
                    </div>
                    <button onClick={() => eliminar(b.id)} className="text-muted-foreground transition-colors hover:text-destructive" aria-label="Eliminar"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
