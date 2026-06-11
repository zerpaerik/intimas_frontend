"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Printer, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatPEN, formatDateLong, initials } from "@/lib/format";
import { api } from "@/lib/api/client";
import { useApiItem } from "@/lib/api/hooks";
import { type Atencion, type AtnEstado } from "@/lib/api/atenciones";
import { PatientHistory } from "./patient-history";
import type { Row } from "@/lib/resources/types";

const ESTADO_COLOR: Record<AtnEstado, string> = {
  Pagado: "#16a34a",
  Parcial: "#f5a623",
  Pendiente: "#ef4444",
};

export function AtencionDetail({ id }: { id: number }) {
  const router = useRouter();
  const { data: atencion, loading } = useApiItem<Atencion>(id ? `/atenciones/${id}` : null);

  const header = (
    <>
      <p className="mb-2 text-sm text-muted-foreground">
        Movimientos <span className="px-1">›</span>
        <button onClick={() => router.push("/movimientos/atenciones")} className="hover:text-foreground">Atenciones</button>
        <span className="px-1">›</span>
        <span className="text-foreground">Detalle</span>
      </p>
      <PageHeader
        title="Detalle de atención"
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/movimientos/atenciones")}>
              <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Volver</span>
            </Button>
            <Button variant="outline" onClick={() => toast.info("Impresión de ticket disponible en la versión final.")}>
              <Printer className="h-4 w-4" /><span className="hidden sm:inline">Ticket</span>
            </Button>
            {atencion && (
              <>
                <Button asChild variant="outline">
                  <Link href={`/movimientos/atenciones/${id}/editar`}><Pencil className="h-4 w-4" />Editar</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" /><span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar atención?</AlertDialogTitle>
                      <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={async () => {
                          try {
                            await api.del(`/atenciones/${id}`);
                            toast.success("Atención eliminada");
                            router.push("/movimientos/atenciones");
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

  if (loading) return <div>{header}<Skeleton className="h-96 w-full rounded-2xl" /></div>;
  if (!atencion)
    return (
      <div>
        {header}
        <div className="rounded-2xl border border-dashed py-20 text-center text-muted-foreground">No se encontró la atención solicitada.</div>
      </div>
    );

  const nombre = `${atencion.paciente?.nombres ?? ""} ${atencion.paciente?.apellidos ?? ""}`.trim();
  const dt = new Date(atencion.fecha);
  const color = ESTADO_COLOR[atencion.estado] ?? "#64748b";

  return (
    <div>
      {header}
      <div className="grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-base font-bold text-white">
                    {initials(nombre)}
                  </span>
                  <div>
                    <CardTitle>{nombre}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {atencion.paciente?.tipoDoc} {atencion.paciente?.numDoc} · {formatDateLong(atencion.fecha)},{" "}
                      {dt.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                  {atencion.estado}
                </span>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-5 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Origen</p>
                <p className="mt-0.5 font-medium">{atencion.origenTipo}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Atendido por</p>
                <p className="mt-0.5 font-medium">{atencion.origenValor || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Registró</p>
                <p className="mt-0.5 font-medium">{atencion.usuario?.nombre ?? "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Servicios e ítems</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Ítem</TableHead>
                    <TableHead className="text-xs">Pago</TableHead>
                    <TableHead className="text-xs text-right">Monto</TableHead>
                    <TableHead className="text-xs text-right">Abono</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atencion.items.map((it, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{it.kind}</span>
                        <div className="font-medium">{it.nombre}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{it.pago}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPEN(it.monto)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPEN(it.abono)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <div className="w-full max-w-xs space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium tabular-nums">{formatPEN(atencion.total)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Abono</span><span className="font-medium tabular-nums text-success">{formatPEN(atencion.abono)}</span></div>
                  <div className="flex justify-between border-t pt-1.5"><span className="font-semibold">Saldo</span><span className={cn("font-bold tabular-nums", atencion.saldo > 0 && "text-destructive")}>{formatPEN(atencion.saldo)}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {atencion.observaciones && (
            <Card>
              <CardHeader><CardTitle>Observaciones</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{atencion.observaciones}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <PatientHistory patient={atencion.paciente as unknown as Row} />
        </div>
      </div>
    </div>
  );
}
