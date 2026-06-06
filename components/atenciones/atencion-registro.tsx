"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ClipboardCheck,
  HeartPulse,
  Plus,
  Trash2,
  UserSearch,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatPEN } from "@/lib/format";
import { useRows } from "@/lib/data/resource-store";
import { useAuth } from "@/lib/auth/store";
import {
  useAtenciones,
  useAtencion,
  type Atencion,
} from "@/lib/data/atenciones-store";
import type { Row } from "@/lib/resources/types";
import { PatientSearch } from "./patient-search";
import { PatientHistory } from "./patient-history";
import { ItemPicker, type CatalogItem } from "./item-picker";

const PAGOS = ["Efectivo", "Tarjeta", "Depósito", "Yape"];
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
  abono: number;
  pago: string;
}

function Step({ n, title, children, icon: Icon }: { n: number; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">
          {n}
        </span>
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
  const createAtencion = useAtenciones((s) => s.createAtencion);
  const updateAtencion = useAtenciones((s) => s.updateAtencion);
  const userName = useAuth((s) => s.session?.user.name ?? "—");
  const personal = useRows("personal");
  const profesionales = useRows("profesionales");

  const [patient, setPatient] = React.useState<Row | null>(
    initial ? ({ ...initial.paciente } as unknown as Row) : null,
  );
  const [origenTipo, setOrigenTipo] = React.useState(initial?.origenTipo ?? "Personal");
  const [origenValor, setOrigenValor] = React.useState(initial?.origenValor ?? "");
  const [items, setItems] = React.useState<LineItem[]>(
    initial ? initial.items.map((it, i) => ({ uid: i + 1, ...it })) : [],
  );
  const [observaciones, setObservaciones] = React.useState(initial?.observaciones ?? "");
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const uid = React.useRef((initial?.items.length ?? 0) + 1);

  const origenOptions =
    origenTipo === "Personal"
      ? personal.map((p) => `${p.nombres} ${p.apellidos}`)
      : origenTipo === "Profesional"
        ? profesionales.map((p) => `${p.nombres} ${p.apellidos}`)
        : [];

  const total = items.reduce((a, b) => a + (b.monto || 0), 0);
  const abono = items.reduce((a, b) => a + (b.abono || 0), 0);
  const saldo = total - abono;

  function addItem(item: CatalogItem) {
    setItems((prev) => [
      ...prev,
      { uid: uid.current++, kind: item.kind, nombre: item.nombre, monto: item.precio, abono: item.precio, pago: "Efectivo" },
    ]);
  }
  const patchItem = (id: number, patch: Partial<LineItem>) =>
    setItems((prev) => prev.map((it) => (it.uid === id ? { ...it, ...patch } : it)));
  const removeItem = (id: number) => setItems((prev) => prev.filter((it) => it.uid !== id));

  function guardar() {
    if (!patient) return toast.error("Primero selecciona o crea un paciente.");
    if (items.length === 0) return toast.error("Agrega al menos un ítem a la atención.");
    const paciente = {
      id: Number(patient.id),
      nombres: String(patient.nombres ?? ""),
      apellidos: String(patient.apellidos ?? ""),
      tipoDoc: String(patient.tipoDoc ?? ""),
      numDoc: String(patient.numDoc ?? ""),
      sexo: String(patient.sexo ?? "Femenino"),
      fechaNacimiento: patient.fechaNacimiento ? String(patient.fechaNacimiento) : undefined,
      telefono: patient.telefono ? String(patient.telefono) : undefined,
    };
    const input = {
      paciente,
      origenTipo,
      origenValor,
      items: items.map(({ uid: _u, ...rest }) => rest),
      observaciones,
      usuario: userName,
    };
    if (mode === "create") {
      const a = createAtencion(input);
      toast.success(`Atención registrada · ${formatPEN(total)}`);
      router.push(`/movimientos/atenciones/${a.id}`);
    } else if (initial) {
      updateAtencion(initial.id, input);
      toast.success("Atención actualizada");
      router.push(`/movimientos/atenciones/${initial.id}`);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Movimientos <span className="px-1">›</span>
        <button onClick={() => router.push("/movimientos/atenciones")} className="hover:text-foreground">
          Atenciones
        </button>
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
              {["Personal", "Profesional", "Particular"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setOrigenTipo(t);
                    setOrigenValor("");
                  }}
                  className={cn(
                    "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                    origenTipo === t ? "border-brand bg-brand/10 text-brand" : "hover:bg-accent/50",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-3">
              {origenTipo === "Particular" ? (
                <Input value={origenValor} onChange={(e) => setOrigenValor(e.target.value)} placeholder="Nombre del particular / referido" />
              ) : (
                <Select value={origenValor} onValueChange={setOrigenValor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Selecciona ${origenTipo.toLowerCase()}…`} />
                  </SelectTrigger>
                  <SelectContent>
                    {origenOptions.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                          {it.kind}
                        </span>
                        <span className="flex-1 text-sm font-medium">{it.nombre}</span>
                        <button onClick={() => removeItem(it.uid)} className="text-muted-foreground transition-colors hover:text-destructive" aria-label="Quitar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2.5 grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Monto</Label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">S/</span>
                            <Input type="number" value={it.monto} onChange={(e) => patchItem(it.uid, { monto: Number(e.target.value) })} className="h-9 pl-7" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Abono</Label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">S/</span>
                            <Input type="number" value={it.abono} onChange={(e) => patchItem(it.uid, { abono: Number(e.target.value) })} className="h-9 pl-7" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Pago</Label>
                          <Select value={it.pago} onValueChange={(v) => patchItem(it.uid, { pago: v })}>
                            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {PAGOS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
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

          <Step n={4} title="Observaciones" icon={ClipboardCheck}>
            <Textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Notas adicionales de la atención…" rows={3} />
          </Step>

          <div className="rounded-2xl border bg-card p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-heading text-xl font-bold">{formatPEN(total)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Abono</p>
                <p className="font-heading text-xl font-bold text-success">{formatPEN(abono)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo</p>
                <p className={cn("font-heading text-xl font-bold", saldo > 0 && "text-destructive")}>{formatPEN(saldo)}</p>
              </div>
            </div>
            <Button className="mt-4 h-11 w-full bg-brand-gradient text-white" onClick={guardar}>
              <ClipboardCheck className="h-4 w-4" />
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
  const hydrated = useAtenciones((s) => s.hydrated);
  const existing = useAtencion(atencionId ?? -1);
  const mode: "create" | "edit" = atencionId ? "edit" : "create";

  if (mode === "edit" && !hydrated) {
    return <Skeleton className="h-[28rem] w-full rounded-2xl" />;
  }
  if (mode === "edit" && !existing) {
    return (
      <div className="rounded-2xl border border-dashed py-20 text-center text-muted-foreground">
        No se encontró la atención solicitada.
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/movimientos/atenciones")}>
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  return <RegistroForm mode={mode} initial={mode === "edit" ? existing : undefined} />;
}
