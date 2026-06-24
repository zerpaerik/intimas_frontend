"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowLeft, CheckCircle2, ClipboardCheck, HandCoins, HeartPulse, Loader2, Plus, Stethoscope, Trash2, UserSearch, Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatPEN } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiItem, useApiList } from "@/lib/api/hooks";
import { METODOS_PAGO, type Atencion } from "@/lib/api/atenciones";
import { useAuth } from "@/lib/auth/store";
import type { Row } from "@/lib/resources/types";
import { PatientSearch } from "./patient-search";
import { PatientHistory } from "./patient-history";
import { ItemPicker, type CatalogItem } from "./item-picker";

const KIND_COLOR: Record<string, string> = {
  Ecografía: "#e6007e",
  "Rayos X": "#0091d5",
  "Salud Mental": "#7c3aed",
  Otros: "#00b8a9",
  Laboratorio: "#f5a623",
  Paquete: "#9b2d69",
  Consulta: "#0091d5",
  Método: "#e6007e",
};

interface LineItem {
  uid: number;
  kind: string;
  nombre: string;
  monto: number;
  esConsulta?: boolean;
  tipoConsultaId?: number;
  prenatal?: boolean;
  pediatrico?: boolean;
  especialidad?: string;
  especialistaId?: number;
}
interface PayLine { uid: number; monto: number; metodo: string }

function Step({ n, title, children, icon: Icon }: { n: number; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">{n}</span>
        <h2 className="flex items-center gap-2 font-heading text-base font-bold">
          <Icon className="h-4 w-4 text-brand" />
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function RegistroForm({ mode, initial }: { mode: "create" | "edit"; initial?: Atencion }) {
  const router = useRouter();
  const sedeId = useAuth((s) => s.session?.sedeId);
  const personal = useApiList<Row>("/personal");
  const profesionales = useApiList<Row>("/profesionales");

  const [patient, setPatient] = React.useState<Row | null>(
    initial ? ({ ...initial.paciente } as unknown as Row) : null,
  );
  const [origenTipo, setOrigenTipo] = React.useState(
    !initial?.origenTipo || initial.origenTipo === "Personal" || initial.origenTipo === "Interno" ? "Interno" : "Externo",
  );
  const [origenValor, setOrigenValor] = React.useState(initial?.origenValor ?? "");
  const [items, setItems] = React.useState<LineItem[]>(
    initial ? initial.items.map((it, i) => ({ uid: i + 1, kind: it.kind, nombre: it.nombre, monto: Number(it.monto) })) : [],
  );
  const [observaciones, setObservaciones] = React.useState(initial?.observaciones ?? "");
  const [pagos, setPagos] = React.useState<PayLine[]>([{ uid: 1, monto: 0, metodo: "Efectivo" }]);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const uid = React.useRef((initial?.items.length ?? 0) + 1);
  const payUid = React.useRef(2);
  const pagosTouched = React.useRef(false);

  const origenOptions =
    origenTipo === "Interno"
      ? personal.data.map((p) => `${p.nombres} ${p.apellidos}`)
      : profesionales.data.map((p) => `${p.nombres} ${p.apellidos}`);

  const total = items.reduce((a, b) => a + (Number(b.monto) || 0), 0);
  const abonado = mode === "edit"
    ? Number(initial?.pagado ?? 0)
    : pagos.reduce((a, b) => a + (Number(b.monto) || 0), 0);
  const saldo = total - abonado;

  // En creación: mientras no se toque el abono, sincronízalo al total (pago completo por defecto).
  React.useEffect(() => {
    if (mode !== "create" || pagosTouched.current) return;
    setPagos((prev) => [{ uid: prev[0]?.uid ?? 1, monto: total, metodo: prev[0]?.metodo ?? "Efectivo" }]);
  }, [total, mode]);

  function addItem(item: CatalogItem) {
    setItems((prev) => [
      ...prev,
      {
        uid: uid.current++,
        kind: item.kind,
        nombre: item.nombre,
        monto: item.precio,
        esConsulta: item.tipoConsultaId != null || item.kind === "Consulta",
        tipoConsultaId: item.tipoConsultaId,
        prenatal: item.prenatal,
        pediatrico: item.pediatrico,
        especialidad: item.especialidad,
      },
    ]);
  }
  const patchItem = (id: number, patch: Partial<LineItem>) =>
    setItems((prev) => prev.map((it) => (it.uid === id ? { ...it, ...patch } : it)));
  const removeItem = (id: number) => setItems((prev) => prev.filter((it) => it.uid !== id));

  const patchPago = (id: number, patch: Partial<PayLine>) => {
    pagosTouched.current = true;
    setPagos((prev) => prev.map((p) => (p.uid === id ? { ...p, ...patch } : p)));
  };
  const addPagoLine = () => {
    pagosTouched.current = true;
    setPagos((prev) => [...prev, { uid: payUid.current++, monto: 0, metodo: "Efectivo" }]);
  };
  const removePagoLine = (id: number) => {
    pagosTouched.current = true;
    setPagos((prev) => (prev.length > 1 ? prev.filter((p) => p.uid !== id) : prev));
  };
  const pagarTodo = () => {
    pagosTouched.current = true;
    setPagos([{ uid: payUid.current++, monto: total, metodo: pagos[0]?.metodo ?? "Efectivo" }]);
  };
  const sinAbono = () => {
    pagosTouched.current = true;
    setPagos([{ uid: payUid.current++, monto: 0, metodo: "Efectivo" }]);
  };

  async function guardar() {
    if (!patient) return toast.error("Primero selecciona o crea un paciente.");
    if (items.length === 0) return toast.error("Agrega al menos un ítem a la atención.");
    if (mode === "create" && abonado > total + 0.001)
      return toast.error("El abono no puede superar el total de la atención.");

    setSaving(true);
    try {
      if (mode === "create") {
        const payload = {
          pacienteId: Number(patient.id),
          sedeId,
          origenTipo,
          origenValor,
          observaciones,
          items: items.map((it) => ({ kind: it.kind, nombre: it.nombre, monto: it.monto })),
          pagos: pagos.filter((p) => (Number(p.monto) || 0) > 0).map((p) => ({ monto: p.monto, metodo: p.metodo })),
          consultas: items
            .filter((it) => it.esConsulta)
            .map((it) => ({
              tipoConsultaId: it.tipoConsultaId,
              tipoNombre: it.nombre,
              especialidad: it.especialidad,
              prenatal: it.prenatal ?? false,
              pediatrico: it.pediatrico ?? false,
              especialistaId: it.especialistaId,
            })),
        };
        const a = await api.post<Atencion>("/atenciones", payload);
        toast.success(`Atención registrada · ${formatPEN(total)}${saldo > 0.001 ? ` · pendiente ${formatPEN(saldo)}` : ""}`);
        router.push(`/movimientos/atenciones/${a.id}`);
      } else if (initial) {
        const payload = {
          origenTipo,
          origenValor,
          observaciones,
          items: items.map((it) => ({ kind: it.kind, nombre: it.nombre, monto: it.monto })),
        };
        await api.patch(`/atenciones/${initial.id}`, payload);
        toast.success("Atención actualizada");
        router.push(`/movimientos/atenciones/${initial.id}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Movimientos <span className="px-1">›</span>
        <button onClick={() => router.push("/movimientos/atenciones")} className="hover:text-foreground">Atenciones</button>
        <span className="px-1">›</span>
        <span className="text-foreground">{mode === "create" ? "Nueva" : "Editar"}</span>
      </p>
      <PageHeader
        title={mode === "create" ? "Registrar atención" : "Editar atención"}
        description="Busca al paciente, revisa su historial y registra los servicios."
        actions={
          <Button variant="outline" onClick={() => router.push("/movimientos/atenciones")}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <Step n={1} title="Paciente" icon={UserSearch}>
            <PatientSearch value={patient} onSelect={setPatient} />
          </Step>

          <Step n={2} title="Origen de la atención" icon={HeartPulse}>
            <div className="flex flex-wrap gap-2">
              {[
                { v: "Interno", label: "Interno (Personal)" },
                { v: "Externo", label: "Externo (Profesional)" },
              ].map((t) => (
                <button
                  key={t.v}
                  type="button"
                  onClick={() => { setOrigenTipo(t.v); setOrigenValor(""); }}
                  className={cn(
                    "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                    origenTipo === t.v ? "border-brand bg-brand/10 text-brand" : "hover:bg-accent/50",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Select value={origenValor} onValueChange={setOrigenValor}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={origenTipo === "Interno" ? "Selecciona del personal…" : "Selecciona profesional…"} />
                </SelectTrigger>
                <SelectContent>
                  {origenOptions.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Step>

          <Step n={3} title="Servicios e ítems" icon={ClipboardCheck}>
            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
                Aún no hay ítems. Agrega servicios, análisis o paquetes.
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((it) => {
                  const color = KIND_COLOR[it.kind] ?? "#64748b";
                  return (
                    <div key={it.uid} className="rounded-xl border p-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                          {it.kind}
                        </span>
                        <span className="flex-1 text-sm font-medium">
                          {it.nombre}
                          {it.prenatal && <span className="ml-1.5 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">prenatal</span>}
                        </span>
                        <div className="relative w-28">
                          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">S/</span>
                          <Input type="number" value={it.monto} onChange={(e) => patchItem(it.uid, { monto: Number(e.target.value) })} className="h-9 pl-7 text-right" />
                        </div>
                        <button onClick={() => removeItem(it.uid)} className="text-muted-foreground transition-colors hover:text-destructive" aria-label="Quitar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {it.esConsulta && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <Stethoscope className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <Select value={it.especialistaId ? String(it.especialistaId) : undefined} onValueChange={(v) => patchItem(it.uid, { especialistaId: v ? Number(v) : undefined })}>
                            <SelectTrigger className="h-9 w-full"><SelectValue placeholder="Asignar especialista (opcional)…" /></SelectTrigger>
                            <SelectContent>
                              {profesionales.data.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {String(p.nombres)} {String(p.apellidos)}{p.especialidad ? ` · ${String(p.especialidad)}` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <Button variant="outline" className="mt-3 w-full border-dashed" onClick={() => setPickerOpen(true)}>
              <Plus className="h-4 w-4" />
              Agregar ítem
            </Button>
          </Step>

          {mode === "create" && (
            <Step n={4} title="Abono inicial" icon={HandCoins}>
              <p className="mb-3 text-xs text-muted-foreground">
                El abono es sobre el total ({formatPEN(total)}). Puede ser parcial y dividirse en varios métodos (ej. S/100 tarjeta + S/50 efectivo + S/50 yape). Lo que falte quedará como cobro pendiente.
              </p>
              <div className="space-y-2.5">
                {pagos.map((p) => (
                  <div key={p.uid} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">S/</span>
                      <Input type="number" value={p.monto} onChange={(e) => patchPago(p.uid, { monto: Number(e.target.value) })} className="h-9 pl-7" />
                    </div>
                    <Select value={p.metodo} onValueChange={(v) => patchPago(p.uid, { metodo: v })}>
                      <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {METODOS_PAGO.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => removePagoLine(p.uid)}
                      disabled={pagos.length <= 1}
                      className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-30"
                      aria-label="Quitar pago"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button type="button" onClick={addPagoLine} className="rounded-md border px-2.5 py-1 font-medium hover:bg-accent/50">+ Dividir método</button>
                <button type="button" onClick={pagarTodo} className="rounded-md border px-2.5 py-1 font-medium hover:bg-accent/50">Pagar todo ({formatPEN(total)})</button>
                <button type="button" onClick={sinAbono} className="rounded-md border px-2.5 py-1 font-medium hover:bg-accent/50">Sin abono</button>
              </div>
            </Step>
          )}

          <Step n={mode === "create" ? 5 : 4} title="Observaciones" icon={ClipboardCheck}>
            <Textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Notas adicionales de la atención…" rows={3} />
          </Step>

          <div className="rounded-2xl border bg-card p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-heading text-xl font-bold">{formatPEN(total)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{mode === "edit" ? "Ya pagado" : "Abonado"}</p>
                <p className="font-heading text-xl font-bold text-success">{formatPEN(abonado)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo</p>
                <p className={cn("font-heading text-xl font-bold", saldo > 0.001 && "text-destructive")}>{formatPEN(saldo)}</p>
              </div>
            </div>

            {mode === "create" && total > 0 && (
              abonado > total + 0.001 ? (
                <p className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-600">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  El abono (<strong>{formatPEN(abonado)}</strong>) supera el total. Ajústalo antes de registrar.
                </p>
              ) : saldo > 0.001 ? (
                <p className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  El abono no cubre el total: se registrará con un <strong>cobro pendiente de {formatPEN(saldo)}</strong> (irá a Cuentas por Cobrar).
                </p>
              ) : (
                <p className="mt-3 flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-xs text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Pago completo: la atención queda saldada.
                </p>
              )
            )}
            {mode === "edit" && (
              <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                Los cobros se gestionan desde el detalle (botón “Abonar”). Aquí solo editas los servicios.
              </p>
            )}

            <Button className="mt-4 h-11 w-full bg-brand-gradient text-white" onClick={guardar} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
              {mode === "create" ? "Registrar atención" : "Guardar cambios"}
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          {patient ? (
            <PatientHistory patient={patient} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/40 px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft">
                <UserSearch className="h-7 w-7 text-brand" />
              </div>
              <p className="font-heading font-semibold">Historial del paciente</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Selecciona o crea un paciente para ver sus antecedentes, atenciones y resultados aquí mismo.
              </p>
            </div>
          )}
        </div>
      </div>

      <ItemPicker open={pickerOpen} onOpenChange={setPickerOpen} onAdd={addItem} />
    </div>
  );
}

export function AtencionRegistro({ atencionId }: { atencionId?: number }) {
  const router = useRouter();
  const mode: "create" | "edit" = atencionId ? "edit" : "create";
  const { data: existing, loading } = useApiItem<Atencion>(atencionId ? `/atenciones/${atencionId}` : null);

  if (mode === "edit" && loading) {
    return <Skeleton className="h-[28rem] w-full rounded-2xl" />;
  }
  if (mode === "edit" && !existing) {
    return (
      <div className="rounded-2xl border border-dashed py-20 text-center text-muted-foreground">
        No se encontró la atención solicitada.
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/movimientos/atenciones")}>Volver al listado</Button>
        </div>
      </div>
    );
  }

  return <RegistroForm mode={mode} initial={mode === "edit" ? existing ?? undefined : undefined} />;
}
