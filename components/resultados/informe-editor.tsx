"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FileCheck2, Loader2, Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calcAge, formatDate, initials } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiItem, useApiList } from "@/lib/api/hooks";
import type {
  PlantillaInforme,
  Resultado,
  ResultadoContexto,
} from "@/lib/api/resultados";
import type { Row } from "@/lib/resources/types";
import { RichTextEditor, type RichTextEditorHandle } from "./rich-text-editor";

const isoToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function InformeEditor({ itemId }: { itemId: number }) {
  const router = useRouter();
  const editorRef = React.useRef<RichTextEditorHandle>(null);
  const { data: ctx, loading } = useApiItem<ResultadoContexto>(`/resultados/contexto/${itemId}`);
  const { data: plantillas } = useApiList<PlantillaInforme>("/resultados/plantillas");
  const { data: profesionales } = useApiList<Row>("/profesionales");

  const [plantillaId, setPlantillaId] = React.useState("");
  const [profesionalId, setProfesionalId] = React.useState("");
  const [fecha, setFecha] = React.useState(isoToday);
  const [observaciones, setObservaciones] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Ordena las plantillas relevantes (del mismo tipo que el estudio) primero.
  const plantillasOrdenadas = React.useMemo(() => {
    const kind = ctx?.kind;
    return [...plantillas].sort((a, b) => {
      const ra = a.tipo === kind ? 0 : 1;
      const rb = b.tipo === kind ? 0 : 1;
      return ra - rb || a.tipo.localeCompare(b.tipo) || a.nombre.localeCompare(b.nombre);
    });
  }, [plantillas, ctx?.kind]);

  const grupos = React.useMemo(() => {
    const map = new Map<string, PlantillaInforme[]>();
    for (const p of plantillasOrdenadas) {
      if (!map.has(p.tipo)) map.set(p.tipo, []);
      map.get(p.tipo)!.push(p);
    }
    return Array.from(map.entries());
  }, [plantillasOrdenadas]);

  function aplicarPlantilla(id: string) {
    setPlantillaId(id);
    const pl = plantillas.find((p) => String(p.id) === id);
    if (pl) editorRef.current?.setHTML(pl.cuerpo);
  }

  async function guardar(imprimir: boolean) {
    const html = editorRef.current?.getHTML()?.trim() ?? "";
    if (!html || html === "<br>" || html === "<p></p>") {
      toast.error("El informe está vacío. Elige una plantilla o escribe el contenido.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post<Resultado>("/resultados/informe", {
        atencionItemId: itemId,
        plantillaId: plantillaId ? Number(plantillaId) : undefined,
        informeHtml: html,
        profesionalId: profesionalId ? Number(profesionalId) : undefined,
        observaciones: observaciones.trim() || undefined,
        fechaResultado: fecha || undefined,
      });
      toast.success("Informe guardado");
      if (imprimir) window.open(`/comprobante-resultado/${res.id}`, "_blank");
      const destino = ctx?.categoria === "Laboratorio" ? "laboratorio" : "servicio";
      router.push(`/resultados/pendientes-${destino}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar el informe");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!ctx) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground">
        No se encontró el estudio.
        <Button variant="outline" onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  if (ctx.yaResuelto) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground">
        <FileCheck2 className="h-8 w-8 text-brand" />
        Este estudio ya tiene un resultado registrado.
        <Button variant="outline" onClick={() => router.push(`/resultados/guardados-${ctx.categoria === "Laboratorio" ? "laboratorio" : "servicio"}`)}>
          Ver en guardados
        </Button>
      </div>
    );
  }

  const nombre = `${ctx.paciente.nombres} ${ctx.paciente.apellidos}`.trim();
  const edad = ctx.paciente.fechaNacimiento ? calcAge(String(ctx.paciente.fechaNacimiento)) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-heading text-xl font-bold">Redactar informe</h1>
          <p className="text-sm text-muted-foreground">{ctx.nombre} · {ctx.kind}</p>
        </div>
      </div>

      {/* Cabecera del paciente (se imprime automáticamente en el informe) */}
      <div className="flex items-center gap-3 rounded-2xl border bg-brand-gradient-soft p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-base font-bold text-white shadow-sm">
          {initials(nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-bold">{nombre}</p>
          <p className="text-xs text-muted-foreground">
            {ctx.paciente.tipoDoc} {ctx.paciente.numDoc}
            {edad != null && ` · ${edad} años`}
            {ctx.paciente.sexo ? ` · ${ctx.paciente.sexo}` : ""}
            {` · Estudio del ${formatDate(ctx.fecha)}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
        <div className="space-y-1.5">
          <Label>Plantilla</Label>
          <Select value={plantillaId} onValueChange={aplicarPlantilla}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Elegir plantilla (o escribe desde cero)" /></SelectTrigger>
            <SelectContent>
              {grupos.map(([tipo, items]) => (
                <SelectGroup key={tipo}>
                  <SelectLabel>{tipo}</SelectLabel>
                  {items.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Médico / firma</Label>
          <Select value={profesionalId} onValueChange={setProfesionalId}>
            <SelectTrigger className="w-full lg:w-[15rem]"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              {profesionales.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{String(p.nombres)} {String(p.apellidos)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <RichTextEditor
        ref={editorRef}
        placeholder="Elige una plantilla arriba o escribe el informe aquí…"
      />

      <div className="space-y-1.5">
        <Label htmlFor="inf-obs">Observaciones internas (no se imprimen)</Label>
        <Textarea id="inf-obs" rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => guardar(false)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
        </Button>
        <Button className="bg-brand-gradient text-white" onClick={() => guardar(true)} disabled={saving}>
          <Printer className="h-4 w-4" /> Guardar e imprimir
        </Button>
      </div>
    </div>
  );
}
