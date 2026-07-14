"use client";

import * as React from "react";
import { toast } from "sonner";
import { Inbox, Loader2, MessagesSquare, Send, TriangleAlert, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDate, initials } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiList } from "@/lib/api/hooks";
import type { Row } from "@/lib/resources/types";
import { type Mensaje, type MensajeUsuario } from "@/lib/api/mensajes";
import { PatientSearch } from "@/components/atenciones/patient-search";

function Redactar({ onDone }: { onDone: () => void }) {
  const { data: usuarios } = useApiList<MensajeUsuario>("/mensajes/destinatarios");
  const [paraId, setParaId] = React.useState("");
  const [paciente, setPaciente] = React.useState<Row | null>(null);
  const [asunto, setAsunto] = React.useState("");
  const [cuerpo, setCuerpo] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function enviar() {
    if (!paraId) return toast.error("Elige el destinatario.");
    if (!cuerpo.trim()) return toast.error("Escribe el mensaje.");
    setSaving(true);
    try {
      await api.post("/mensajes", {
        paraId: Number(paraId),
        pacienteId: paciente ? Number(paciente.id) : undefined,
        asunto: asunto.trim() || undefined,
        cuerpo: cuerpo.trim(),
      });
      toast.success("Mensaje enviado");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo enviar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Para *</Label>
        <Select value={paraId} onValueChange={setParaId}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Elige un usuario…" /></SelectTrigger>
          <SelectContent>
            {usuarios.map((u) => (
              <SelectItem key={u.id} value={String(u.id)}>
                {u.nombre}{u.role?.nombre ? ` · ${u.role.nombre}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Paciente relacionado (opcional)</Label>
        <PatientSearch value={paciente} onSelect={setPaciente} />
      </div>
      <div className="space-y-1.5">
        <Label>Asunto (opcional)</Label>
        <Input value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Ej. Ecografía por atender" />
      </div>
      <div className="space-y-1.5">
        <Label>Mensaje *</Label>
        <Textarea value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} rows={4} placeholder="Escribe tu mensaje…" />
      </div>
      <Button className="w-full bg-brand-gradient text-white" onClick={enviar} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {saving ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </div>
  );
}

export function MensajesPanel() {
  const [box, setBox] = React.useState<"inbox" | "sent">("inbox");
  const [open, setOpen] = React.useState(false);
  const { data: mensajes, loading, error, refetch } = useApiList<Mensaje>(`/mensajes?box=${box}`);

  async function marcarLeido(m: Mensaje) {
    if (box !== "inbox" || m.leido) return;
    try {
      await api.post(`/mensajes/${m.id}/leido`, {});
      refetch();
    } catch {
      /* silencioso */
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Mensajes"
        description="Mensajería interna entre el personal (ej. recepción → médico)."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-gradient text-white"><Send className="h-4 w-4" /> Redactar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><MessagesSquare className="h-5 w-5 text-brand" /> Nuevo mensaje</DialogTitle>
                <DialogDescription>Envía un mensaje interno a otro usuario del sistema.</DialogDescription>
              </DialogHeader>
              <Redactar onDone={() => { setOpen(false); refetch(); }} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 inline-flex rounded-xl border bg-card p-1">
        {([["inbox", "Recibidos", Inbox], ["sent", "Enviados", Send]] as const).map(([v, label, Icon]) => (
          <button
            key={v}
            onClick={() => setBox(v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              box === v ? "bg-brand-gradient text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border py-16 text-center text-sm text-muted-foreground">
          <TriangleAlert className="h-6 w-6 text-destructive" /> No se pudo cargar.
          <Button variant="outline" size="sm" onClick={refetch} className="mt-1">Reintentar</Button>
        </div>
      ) : loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : mensajes.length === 0 ? (
        <div className="rounded-2xl border py-16 text-center text-sm text-muted-foreground">
          {box === "inbox" ? "No tienes mensajes recibidos." : "No has enviado mensajes."}
        </div>
      ) : (
        <div className="space-y-2.5">
          {mensajes.map((m) => {
            const persona = box === "inbox" ? m.de?.nombre : m.para?.nombre;
            const noLeido = box === "inbox" && !m.leido;
            return (
              <div
                key={m.id}
                onClick={() => marcarLeido(m)}
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  noLeido ? "cursor-pointer border-brand/30 bg-brand-gradient-soft" : "bg-card",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">
                    {initials(persona ?? "?")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {box === "inbox" ? "De: " : "Para: "}{persona ?? "—"}
                      {noLeido && <span className="ml-2 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">nuevo</span>}
                    </p>
                    {m.asunto && <p className="truncate text-sm font-medium text-foreground/90">{m.asunto}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{m.cuerpo}</p>
                {m.paciente && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5" />
                    Paciente: {m.paciente.nombres} {m.paciente.apellidos}{m.paciente.numDoc ? ` · ${m.paciente.numDoc}` : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
