"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, FileUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api/client";
import { useApiList } from "@/lib/api/hooks";
import type { Row } from "@/lib/resources/types";
import type { ResultadoPendiente } from "@/lib/api/resultados";

const isoToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function UploadForm({ item, onDone }: { item: ResultadoPendiente; onDone: () => void }) {
  const { data: laboratorios } = useApiList<Row>("/laboratorios");
  const { data: profesionales } = useApiList<Row>("/profesionales");
  const [file, setFile] = React.useState<File | null>(null);
  const [laboratorioId, setLaboratorioId] = React.useState("");
  const [profesionalId, setProfesionalId] = React.useState("");
  const [fecha, setFecha] = React.useState(isoToday);
  const [observaciones, setObservaciones] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!file) {
      toast.error("Selecciona el archivo del resultado.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("atencionItemId", String(item.itemId));
      fd.append("file", file);
      if (laboratorioId) fd.append("laboratorioId", laboratorioId);
      if (profesionalId) fd.append("profesionalId", profesionalId);
      if (fecha) fd.append("fechaResultado", fecha);
      if (observaciones.trim()) fd.append("observaciones", observaciones.trim());
      await api.upload("/resultados/archivo", fd);
      toast.success("Resultado cargado");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cargar el resultado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-brand-gradient-soft p-3 text-sm">
        <p className="font-semibold">{item.nombre}</p>
        <p className="text-xs text-muted-foreground">
          {item.paciente.nombres} {item.paciente.apellidos} · {item.paciente.tipoDoc} {item.paciente.numDoc}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="res-file">Archivo del resultado *</Label>
        <Input
          id="res-file"
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-brand/10 file:px-3 file:py-1 file:text-brand"
        />
        <p className="text-xs text-muted-foreground">PDF o imagen (máx. 20 MB).</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Laboratorio de origen</Label>
          <Select value={laboratorioId} onValueChange={setLaboratorioId}>
            <SelectTrigger className="w-full"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              {laboratorios.map((l) => (
                <SelectItem key={l.id} value={String(l.id)}>{String(l.nombre)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="res-fecha">Fecha del resultado</Label>
          <Input id="res-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Profesional responsable (opcional)</Label>
        <Select value={profesionalId} onValueChange={setProfesionalId}>
          <SelectTrigger className="w-full"><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>
            {profesionales.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {String(p.nombres)} {String(p.apellidos)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="res-obs">Observaciones (opcional)</Label>
        <Textarea id="res-obs" rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
      </div>

      <Button className="w-full bg-brand-gradient text-white" onClick={submit} disabled={saving}>
        <Check className="h-4 w-4" />
        {saving ? "Cargando…" : "Guardar resultado"}
      </Button>
    </div>
  );
}

export function UploadDialog({
  item,
  onDone,
  trigger,
}: {
  item: ResultadoPendiente;
  onDone: () => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="bg-brand-gradient text-white">
            <Upload className="h-4 w-4" /> Adjuntar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-brand" /> Cargar resultado de laboratorio
          </DialogTitle>
          <DialogDescription>
            Adjunta el archivo (PDF o imagen) que llegó del laboratorio.
          </DialogDescription>
        </DialogHeader>
        <UploadForm
          item={item}
          onDone={() => {
            setOpen(false);
            onDone();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
