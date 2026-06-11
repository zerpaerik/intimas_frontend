"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";

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
import { Card, CardContent } from "@/components/ui/card";
import { MultiSelect } from "@/components/forms/multi-select";
import { cn } from "@/lib/utils";
import { getResource, endpointFor } from "@/lib/resources";
import type { FieldDef, ResourceConfig, Row, SelectOption } from "@/lib/resources/types";
import { api } from "@/lib/api/client";
import { useApiItem, useApiList } from "@/lib/api/hooks";

const NUMERIC = ["number", "currency", "percent"];

function buildSchema(fields: FieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    if (f.type === "multiselect") {
      shape[f.name] = z.array(z.string());
    } else if (NUMERIC.includes(f.type)) {
      shape[f.name] = f.required
        ? z.string().min(1, "Requerido").refine((v) => !isNaN(Number(v)), "Número inválido")
        : z.string().refine((v) => v === "" || !isNaN(Number(v)), "Número inválido");
    } else if (f.type === "email") {
      shape[f.name] = f.required
        ? z.string().min(1, "Requerido").email("Correo inválido")
        : z.string().refine((v) => v === "" || z.string().email().safeParse(v).success, "Correo inválido");
    } else {
      shape[f.name] = f.required ? z.string().min(1, "Requerido") : z.string();
    }
  }
  return z.object(shape);
}

function buildDefaults(fields: FieldDef[], existing?: Row | null) {
  const d: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === "multiselect") {
      const v = existing?.[f.name];
      d[f.name] = Array.isArray(v)
        ? v.map((x) => (typeof x === "object" && x ? String((x as { id: number }).id) : String(x)))
        : [];
    } else if (f.type === "date") {
      const v = existing?.[f.name];
      d[f.name] = v ? String(v).slice(0, 10) : "";
    } else {
      d[f.name] = existing?.[f.name] != null ? String(existing[f.name]) : "";
    }
  }
  return d;
}

function FormInner({
  cfg,
  mode,
  existing,
  optionsData,
}: {
  cfg: ResourceConfig;
  mode: "create" | "edit";
  existing?: Row | null;
  optionsData: Record<string, Row[]>;
}) {
  const router = useRouter();
  const endpoint = `/${endpointFor(cfg.key)}`;
  const schema = React.useMemo(() => buildSchema(cfg.fields), [cfg]);
  const defaults = React.useMemo(() => buildDefaults(cfg.fields, existing), [cfg, existing]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: defaults });

  function resolveOptions(field: FieldDef): SelectOption[] {
    if (field.options) return field.options;
    if (field.optionsFrom) {
      const rel = getResource(field.optionsFrom);
      const key = rel?.titleKey ?? "nombre";
      return (optionsData[field.optionsFrom] ?? []).map((r) => ({
        value: String(r.id),
        label: String(r[key]),
      }));
    }
    return [];
  }

  async function onSubmit(values: Record<string, unknown>) {
    const payload: Record<string, unknown> = { ...values };
    for (const f of cfg.fields) {
      if (NUMERIC.includes(f.type)) {
        payload[f.name] = values[f.name] === "" ? 0 : Number(values[f.name]);
      } else if (f.optionsFrom && f.type === "select") {
        payload[f.name] = values[f.name] === "" ? null : Number(values[f.name]);
      } else if (f.optionsFrom && f.type === "multiselect") {
        payload[f.name] = ((values[f.name] as string[]) ?? []).map(Number);
      }
    }
    try {
      if (mode === "create") {
        const created = await api.post<Row>(endpoint, payload);
        toast.success(`${cfg.singular} creado correctamente`);
        router.push(`${cfg.path}/${created.id}`);
      } else if (existing) {
        await api.patch(`${endpoint}/${existing.id}`, payload);
        toast.success(`${cfg.singular} actualizado`);
        router.push(`${cfg.path}/${existing.id}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            {cfg.fields.map((f) => {
              const err = errors[f.name]?.message as string | undefined;
              return (
                <div key={f.name} className={cn("space-y-1.5", f.span === 2 && "sm:col-span-2")}>
                  <Label htmlFor={f.name}>
                    {f.label}
                    {f.required && <span className="ml-0.5 text-destructive">*</span>}
                  </Label>
                  <Controller
                    control={control}
                    name={f.name}
                    render={({ field }) => {
                      if (f.type === "select") {
                        const opts = resolveOptions(f);
                        return (
                          <Select value={(field.value as string) || undefined} onValueChange={field.onChange}>
                            <SelectTrigger id={f.name} className="w-full" aria-invalid={!!err}>
                              <SelectValue placeholder={f.placeholder ?? "Selecciona…"} />
                            </SelectTrigger>
                            <SelectContent>
                              {opts.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      }
                      if (f.type === "multiselect") {
                        return (
                          <MultiSelect
                            options={resolveOptions(f)}
                            value={(field.value as string[]) ?? []}
                            onChange={field.onChange}
                            placeholder={f.placeholder}
                          />
                        );
                      }
                      if (f.type === "textarea") {
                        return (
                          <Textarea id={f.name} placeholder={f.placeholder} aria-invalid={!!err} {...field} value={field.value as string} />
                        );
                      }
                      const isNum = NUMERIC.includes(f.type);
                      const isCurrency = f.type === "currency";
                      const isPercent = f.type === "percent";
                      return (
                        <div className="relative">
                          {isCurrency && (
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">S/</span>
                          )}
                          <Input
                            id={f.name}
                            type={isNum ? "number" : f.type === "date" ? "date" : f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}
                            inputMode={isNum ? "decimal" : undefined}
                            step={isCurrency ? "0.01" : undefined}
                            placeholder={f.placeholder}
                            aria-invalid={!!err}
                            className={cn(isCurrency && "pl-8", isPercent && "pr-8")}
                            {...field}
                            value={field.value as string}
                            onChange={(e) =>
                              field.onChange(f.type === "uppercase" ? e.target.value.toUpperCase() : e.target.value)
                            }
                          />
                          {isPercent && (
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                          )}
                        </div>
                      );
                    }}
                  />
                  {f.help && !err && <p className="text-xs text-muted-foreground">{f.help}</p>}
                  {err && <p className="text-xs text-destructive">{err}</p>}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t pt-5">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-brand-gradient text-white">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {mode === "create" ? "Crear" : "Guardar cambios"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export function ResourceForm({
  resourceKey,
  mode,
  id,
}: {
  resourceKey: string;
  mode: "create" | "edit";
  id?: number;
}) {
  const router = useRouter();
  const cfg = getResource(resourceKey);
  const endpoint = cfg ? `/${endpointFor(cfg.key)}` : null;

  const { data: existing, loading } = useApiItem<Row>(
    mode === "edit" && endpoint && id ? `${endpoint}/${id}` : null,
  );

  const optKeys = React.useMemo(
    () => [...new Set((cfg?.fields ?? []).filter((f) => f.optionsFrom).map((f) => f.optionsFrom!))],
    [cfg],
  );
  const list0 = useApiList<Row>(optKeys[0] ? `/${endpointFor(optKeys[0])}` : null);
  const list1 = useApiList<Row>(optKeys[1] ? `/${endpointFor(optKeys[1])}` : null);
  const optionsData: Record<string, Row[]> = {};
  if (optKeys[0]) optionsData[optKeys[0]] = list0.data;
  if (optKeys[1]) optionsData[optKeys[1]] = list1.data;

  if (!cfg) {
    return <div className="py-20 text-center text-muted-foreground">Recurso no encontrado.</div>;
  }

  const title = mode === "create" ? `Nuevo ${cfg.singular.toLowerCase()}` : `Editar ${cfg.singular.toLowerCase()}`;
  const header = (
    <>
      <p className="mb-2 text-sm text-muted-foreground">
        Archivo <span className="px-1">›</span>
        <button onClick={() => router.push(cfg.path)} className="hover:text-foreground">
          {cfg.plural}
        </button>
        <span className="px-1">›</span>
        <span className="text-foreground">{mode === "create" ? "Nuevo" : "Editar"}</span>
      </p>
      <PageHeader
        title={<span className="capitalize">{title}</span>}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
      />
    </>
  );

  if (mode === "edit" && loading) {
    return (
      <div className="mx-auto max-w-3xl">
        {header}
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }
  if (mode === "edit" && !existing) {
    return (
      <div className="mx-auto max-w-3xl">
        {header}
        <div className="rounded-2xl border border-dashed py-20 text-center text-muted-foreground">
          No se encontró el registro solicitado.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {header}
      <FormInner cfg={cfg} mode={mode} existing={mode === "edit" ? existing : undefined} optionsData={optionsData} />
    </div>
  );
}
