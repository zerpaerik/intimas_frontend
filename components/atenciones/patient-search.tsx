"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, IdCard, Search, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calcAge, initials } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiList } from "@/lib/api/hooks";
import type { Row } from "@/lib/resources/types";

export function PatientSearch({
  value,
  onSelect,
}: {
  value: Row | null;
  onSelect: (p: Row | null) => void;
}) {
  const { data: pacientes, refetch } = useApiList<Row>("/pacientes");

  const [query, setQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    nombres: "",
    apellidos: "",
    tipoDoc: "DNI",
    numDoc: "",
    sexo: "Femenino",
    telefono: "",
  });

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return pacientes
      .filter(
        (p) =>
          String(p.numDoc ?? "").toLowerCase().includes(q) ||
          `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [pacientes, query]);

  const noResults = query.trim().length >= 3 && results.length === 0;

  function startCreate() {
    setForm((f) => ({ ...f, numDoc: /^\d+$/.test(query.trim()) ? query.trim() : f.numDoc }));
    setCreating(true);
  }

  async function submitCreate() {
    if (!form.nombres.trim() || !form.apellidos.trim() || !form.numDoc.trim()) {
      toast.error("Completa nombres, apellidos y documento.");
      return;
    }
    setSaving(true);
    try {
      const nuevo = await api.post<Row>("/pacientes", {
        nombres: form.nombres.toUpperCase(),
        apellidos: form.apellidos.toUpperCase(),
        tipoDoc: form.tipoDoc,
        numDoc: form.numDoc,
        sexo: form.sexo,
        telefono: form.telefono,
      });
      toast.success("Paciente creado · registro retomado");
      refetch();
      setCreating(false);
      setQuery("");
      onSelect(nuevo);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo crear el paciente");
    } finally {
      setSaving(false);
    }
  }

  if (value) {
    const nombre = `${value.nombres ?? ""} ${value.apellidos ?? ""}`.trim();
    const edad = value.fechaNacimiento ? calcAge(String(value.fechaNacimiento)) : null;
    return (
      <div className="flex items-center gap-3 rounded-xl border bg-brand-gradient-soft p-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white">
          {initials(nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{nombre}</p>
          <p className="text-xs text-muted-foreground">
            {String(value.tipoDoc ?? "")} {String(value.numDoc ?? "")}
            {edad != null && ` · ${edad} años`} · {String(value.sexo ?? "")}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
          <X className="h-4 w-4" />
          Cambiar
        </Button>
      </div>
    );
  }

  if (creating) {
    return (
      <div className="rounded-xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <UserPlus className="h-4 w-4 text-brand" />
            Alta rápida de paciente
          </p>
          <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>
            Cancelar
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="qc-nombres">Nombres *</Label>
            <Input id="qc-nombres" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qc-apellidos">Apellidos *</Label>
            <Input id="qc-apellidos" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo doc.</Label>
            <Select value={form.tipoDoc} onValueChange={(v) => setForm({ ...form, tipoDoc: v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["DNI", "CE", "PTP", "Pasaporte", "Otro"].map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qc-num">N° documento *</Label>
            <Input id="qc-num" value={form.numDoc} onChange={(e) => setForm({ ...form, numDoc: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Sexo</Label>
            <Select value={form.sexo} onValueChange={(v) => setForm({ ...form, sexo: v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Femenino">Femenino</SelectItem>
                <SelectItem value="Masculino">Masculino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qc-tel">Teléfono</Label>
            <Input id="qc-tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
        </div>
        <Button className="mt-4 w-full bg-brand-gradient text-white" onClick={submitCreate} disabled={saving}>
          <Check className="h-4 w-4" />
          {saving ? "Creando…" : "Crear y continuar"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar paciente por DNI o nombre…"
          className="pl-9"
        />
      </div>

      {results.length > 0 && (
        <div className="mt-2 overflow-hidden rounded-xl border">
          {results.map((p) => {
            const nombre = `${p.nombres} ${p.apellidos}`;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setQuery("");
                  onSelect(p);
                }}
                className="flex w-full items-center gap-3 border-b p-2.5 text-left last:border-0 transition-colors hover:bg-accent/50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft text-xs font-bold text-brand">
                  {initials(nombre)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{nombre}</span>
                  <span className="block text-xs text-muted-foreground">
                    {String(p.tipoDoc ?? "")} {String(p.numDoc ?? "")}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {noResults && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-dashed p-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <IdCard className="h-4 w-4" />
            No se encontró el paciente.
          </span>
          <Button size="sm" onClick={startCreate} className="bg-brand-gradient text-white">
            <UserPlus className="h-4 w-4" />
            Crear paciente
          </Button>
        </div>
      )}
    </div>
  );
}
