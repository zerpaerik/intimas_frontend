"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, Loader2, UserSearch } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";
import { useApiList } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/store";
import { METODOS_PAGO } from "@/lib/api/atenciones";
import type { Row } from "@/lib/resources/types";
import type { Cita } from "@/lib/api/citas";
import type { Slot } from "@/lib/api/agenda";
import { PatientSearch } from "@/components/atenciones/patient-search";

function isoToday() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function CitaForm() {
  const router = useRouter();
  const sedeId = useAuth((s) => s.session?.sedeId);
  const usuarios = useApiList<Row>("/usuarios");
  const medicos = usuarios.data.filter((u) => Number(u.roleId) === 10);

  const [patient, setPatient] = React.useState<Row | null>(null);
  const [medicoId, setMedicoId] = React.useState("");
  const [fecha, setFecha] = React.useState(isoToday);
  const [hora, setHora] = React.useState("");
  const [manual, setManual] = React.useState(false);
  const [motivo, setMotivo] = React.useState("");
  const [monto, setMonto] = React.useState("");
  const [metodoPago, setMetodoPago] = React.useState("Efectivo");
  const [abono, setAbono] = React.useState("");
  const [observaciones, setObservaciones] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const { data: slots } = useApiList<Slot>(medicoId && fecha ? `/agenda/slots?medicoId=${medicoId}&fecha=${fecha}` : null);

  async function guardar() {
    if (!patient) return toast.error("Selecciona el paciente.");
    if (!medicoId) return toast.error("Selecciona el médico.");
    if (!fecha || !hora) return toast.error("Elige un turno u hora para la cita.");
    setSaving(true);
    try {
      await api.post<Cita>("/citas", {
        pacienteId: Number(patient.id),
        medicoId: Number(medicoId),
        fecha,
        hora,
        motivo: motivo.trim() || undefined,
        monto: monto === "" ? 0 : Number(monto),
        metodoPago,
        pagado: abono === "" ? 0 : Number(abono),
        sedeId: sedeId ?? undefined,
        observaciones: observaciones.trim() || undefined,
      });
      toast.success("Cita registrada");
      router.push("/citas");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo registrar la cita");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-2 text-sm text-muted-foreground">
        Citas <span className="px-1">›</span>
        <span className="text-foreground">Nueva</span>
      </p>
      <PageHeader
        title="Nueva cita"
        description="Agenda una cita con el médico."
        actions={<Button variant="outline" onClick={() => router.push("/citas")}><ArrowLeft className="h-4 w-4" /> Volver</Button>}
      />

      <div className="space-y-5">
        <section className="rounded-2xl border bg-card p-5">
          <Label className="mb-2 flex items-center gap-2 text-sm font-semibold"><UserSearch className="h-4 w-4 text-brand" /> Paciente</Label>
          <PatientSearch value={patient} onSelect={setPatient} />
        </section>

        <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Médico</Label>
            <Select value={medicoId} onValueChange={(v) => { setMedicoId(v); setHora(""); }}>
              <SelectTrigger><SelectValue placeholder="Selecciona el médico…" /></SelectTrigger>
              <SelectContent>
                {medicos.length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">No hay médicos (usuarios con rol Profesional de salud).</div>
                )}
                {medicos.map((m) => <SelectItem key={m.id} value={String(m.id)}>{String(m.nombre)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Motivo (opcional)</Label>
            <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ecografía, consulta…" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Fecha</Label>
            <Input type="date" value={fecha} onChange={(e) => { setFecha(e.target.value); setHora(""); }} className="sm:w-1/2" />
          </div>
        </section>

        {/* Turno */}
        <section className="rounded-2xl border bg-card p-5">
          <Label className="mb-2 block">Turno</Label>
          {!medicoId || !fecha ? (
            <p className="text-sm text-muted-foreground">Elige médico y fecha para ver los turnos disponibles.</p>
          ) : (
            <>
              {slots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.hora}
                      type="button"
                      disabled={s.ocupado}
                      onClick={() => { setHora(s.hora); setManual(false); }}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm tabular-nums transition-colors",
                        s.ocupado
                          ? "cursor-not-allowed bg-muted text-muted-foreground line-through"
                          : hora === s.hora && !manual
                            ? "border-brand bg-brand/10 text-brand"
                            : "hover:bg-accent/50",
                      )}
                    >
                      {s.hora}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Este médico no tiene horario cargado ese día. Puedes agendar un horario adicional.</p>
              )}
              <button type="button" onClick={() => setManual((v) => !v)} className="mt-3 text-xs font-medium text-brand hover:underline">
                {manual ? "Elegir de los turnos" : "Agendar en otro horario (adicional)"}
              </button>
              {(manual || slots.length === 0) && (
                <div className="mt-2 flex items-center gap-2">
                  <Input type="time" value={hora} onChange={(e) => { setHora(e.target.value); setManual(true); }} className="w-40" />
                  <span className="text-xs text-muted-foreground">Fuera de la agenda del médico.</span>
                </div>
              )}
              {hora && <p className="mt-3 text-sm">Turno: <strong className="tabular-nums">{hora}</strong></p>}
            </>
          )}
        </section>

        <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Monto total (S/)</Label>
            <Input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <Label>Abono ahora (S/)</Label>
            <Input type="number" value={abono} onChange={(e) => setAbono(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <Label>Método de pago</Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{METODOS_PAGO.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-3">
            Abono 0 = queda <strong>pendiente</strong>. Menos que el monto = <strong>parcial</strong> (el saldo queda por cobrar). Igual al monto = <strong>pagada</strong>. El abono se cobra en el <strong>turno de caja abierto</strong> y suma hoy.
          </p>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <Label className="mb-2 block">Observaciones</Label>
          <Textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} />
        </section>

        <Button className="h-11 w-full bg-brand-gradient text-white" onClick={guardar} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />} Registrar cita
        </Button>
      </div>
    </div>
  );
}
