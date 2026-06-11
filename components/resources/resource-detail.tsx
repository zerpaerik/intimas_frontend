"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatPEN, formatDate, calcAge, initials } from "@/lib/format";
import { getResource, endpointFor } from "@/lib/resources";
import type { FieldDef, ResourceConfig, Row } from "@/lib/resources/types";
import { api } from "@/lib/api/client";
import { useApiItem } from "@/lib/api/hooks";

function relName(value: unknown, fallback?: unknown) {
  if (value && typeof value === "object") return (value as { nombre?: string }).nombre ?? "";
  return value ?? fallback ?? "";
}

function FieldValue({
  field,
  row,
  colorMap,
}: {
  field: FieldDef;
  row: Row;
  colorMap?: Record<string, string>;
}) {
  if (field.type === "multiselect") {
    const arr = Array.isArray(row[field.name]) ? (row[field.name] as unknown[]) : [];
    if (!arr.length) return <span className="text-muted-foreground">—</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {arr.map((t, i) => {
          const label = typeof t === "object" && t ? (t as { nombre?: string }).nombre : String(t);
          return (
            <span key={i} className="rounded-md bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
              {label}
            </span>
          );
        })}
      </div>
    );
  }

  // Llave foránea (select con optionsFrom): muestra el nombre de la relación
  if (field.optionsFrom && field.type === "select") {
    const display = relName(row[field.name.replace(/Id$/, "")], row[field.name]);
    return display ? <span>{String(display)}</span> : <span className="text-muted-foreground">—</span>;
  }

  const value = row[field.name];
  if (value == null || value === "") return <span className="text-muted-foreground">—</span>;
  if (field.type === "currency") return <span className="font-medium tabular-nums">{formatPEN(Number(value))}</span>;
  if (field.type === "percent") return <span className="tabular-nums">{Number(value)}%</span>;
  if (field.type === "date") {
    const base = formatDate(String(value));
    const isBirth = /naci/i.test(field.name);
    return <span>{isBirth ? `${base} · ${calcAge(String(value))} años` : base}</span>;
  }
  if (colorMap) {
    const color = colorMap[String(value)] ?? "#64748b";
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
      >
        {String(value)}
      </span>
    );
  }
  return <span>{String(value)}</span>;
}

function DetailInner({ cfg, row }: { cfg: ResourceConfig; row: Row }) {
  const title = String(row[cfg.titleKey] ?? cfg.singular);
  const subtitle = cfg.subtitleKey ? String(row[cfg.subtitleKey] ?? "") : "";
  const colorByKey = React.useMemo(() => {
    const m: Record<string, Record<string, string>> = {};
    for (const c of cfg.columns) if (c.colorMap) m[c.key] = c.colorMap;
    return m;
  }, [cfg]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-brand-gradient-soft">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-bold text-white shadow-sm">
            {initials(title)}
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-xl font-bold">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <dl className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
          {cfg.fields.map((f) => (
            <div key={f.name} className={cn(f.span === 2 && "sm:col-span-2")}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{f.label}</dt>
              <dd className="mt-1 text-sm">
                <FieldValue field={f} row={row} colorMap={colorByKey[f.name]} />
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

export function ResourceDetail({ resourceKey, id }: { resourceKey: string; id: number }) {
  const router = useRouter();
  const cfg = getResource(resourceKey);
  const endpoint = cfg ? `/${endpointFor(cfg.key)}` : null;
  const { data: raw, loading } = useApiItem<Row>(endpoint && id ? `${endpoint}/${id}` : null);

  const row = React.useMemo(
    () => (raw && cfg?.derive ? { ...raw, ...cfg.derive(raw) } : raw),
    [raw, cfg],
  );

  if (!cfg) {
    return <div className="py-20 text-center text-muted-foreground">Recurso no encontrado.</div>;
  }

  const header = (
    <>
      <p className="mb-2 text-sm text-muted-foreground">
        Archivo <span className="px-1">›</span>
        <button onClick={() => router.push(cfg.path)} className="hover:text-foreground">
          {cfg.plural}
        </button>
        <span className="px-1">›</span>
        <span className="text-foreground">Detalle</span>
      </p>
      <PageHeader
        title={cfg.singular}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(cfg.path)}>
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            {row && (
              <>
                <Button asChild variant="outline">
                  <Link href={`${cfg.path}/${id}/editar`}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                      <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={async () => {
                          try {
                            await api.del(`${endpoint}/${id}`);
                            toast.success(`${cfg.singular} eliminado`);
                            router.push(cfg.path);
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
                          }
                        }}
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </>
        }
      />
    </>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        {header}
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }
  if (!row) {
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
      <DetailInner cfg={cfg} row={row} />
    </div>
  );
}
