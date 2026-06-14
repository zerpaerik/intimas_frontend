"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Ban, HandCoins, Pencil, Printer, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatPEN, formatDateLong, initials } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { isToday, type Atencion, type AtnEstado } from "@/lib/api/atenciones";
import { useAuth } from "@/lib/auth/store";
import { CobroDialog } from "./cobro-dialog";
import { AnularDialog } from "./anular-dialog";
import { PatientHistory } from "./patient-history";
import type { Row } from "@/lib/resources/types";

const ESTADO_COLOR: Record<AtnEstado, string> = {
  Pagado: "#16a34a",
  Parcial: "#f5a623",
  Pendiente: "#ef4444",
};

const horaCorta = new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" });

export function AtencionDetail({ id }: { id: number }) {
  const router = useRouter();
  const roleId = useAuth((s) => s.session?.roleId ?? 1);
  const { data: atencion, loading, refetch } = useApiItem<Atencion>(id ? `/atenciones/${id}` : null);
  const [cobroOpen, setCobroOpen] = React.useState(false);
  const [anularOpen, setAnularOpen] = React.useState(false);

  const anulada = !!atencion?.anulada;
  const puedeEditar = !!atencion && !anulada && (isToday(atencion.fecha) || roleId === 1);
  const saldo = Number(atencion?.saldo ?? 0);

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
            {atencion && !anulada && (
              <>
                {saldo > 0 && (
                  <Button className="bg-brand-gradient text-white" onClick={() => setCobroOpen(true)}>
                    <HandCoins className="h-4 w-4" /><span className="hidden sm:inline">Abonar</span>
                  </Button>
                )}
                {puedeEditar && (
                  <Button asChild variant="outline">
                    <Link href={`/movimientos/atenciones/${id}/editar`}><Pencil className="h-4 w-4" /><span className="hidden sm:inline">Editar</span></Link>
                  </Button>
                )}
                <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setAnularOpen(true)}>
                  <Ban className="h-4 w-4" /><span className="hidden sm:inline">Anular</span>
                </Button>
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
  const color = anulada ? "#64748b" : (ESTADO_COLOR[atencion.estado] ?? "#64748b");

  return (
    <div>
      {header}

      {anulada && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="text-sm">
            <p className="font-semibold text-destructive">Atención anulada</p>
            <p className="text-muted-foreground">
              Anulada por <strong className="text-foreground">{atencion.anuladaPor?.nombre ?? "—"}</strong>
              {atencion.anuladaAt && <> el {formatDateLong(atencion.anuladaAt)}</>}.
              {atencion.motivoAnulacion && <> Motivo: <span className="text-foreground">{atencion.motivoAnulacion}</span></>}
            </p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <Card className={cn(anulada && "opacity-80")}>
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
                      {horaCorta.format(dt)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                  {anulada ? "Anulada" : atencion.estado}
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
                    <TableHead className="text-xs text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atencion.items.map((it, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{it.kind}</span>
                        <div className="font-medium">{it.nombre}</div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatPEN(Number(it.monto))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <div className="w-full max-w-xs space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium tabular-nums">{formatPEN(Number(atencion.total))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Pagado</span><span className="font-medium tabular-nums text-success">{formatPEN(Number(atencion.pagado))}</span></div>
                  <div className="flex justify-between border-t pt-1.5"><span className="font-semibold">Saldo</span><span className={cn("font-bold tabular-nums", saldo > 0 && "text-destructive")}>{formatPEN(saldo)}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pagos</CardTitle>
                {!anulada && saldo > 0 && (
                  <Button size="sm" variant="outline" onClick={() => setCobroOpen(true)}>
                    <HandCoins className="h-4 w-4" /> Abonar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {atencion.pagos.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {anulada ? "Los pagos fueron anulados junto con la atención." : "Sin pagos registrados. Esta atención está al crédito."}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">Fecha</TableHead>
                      <TableHead className="text-xs">Tipo</TableHead>
                      <TableHead className="text-xs">Método</TableHead>
                      <TableHead className="text-xs text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atencion.pagos.map((p) => {
                      const pdt = new Date(p.fecha);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="text-muted-foreground">{formatDateLong(p.fecha)}, {horaCorta.format(pdt)}</TableCell>
                          <TableCell><span className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{p.tipo === "ABONO_INICIAL" ? "Abono inicial" : "Cobro"}</span></TableCell>
                          <TableCell className="text-muted-foreground">{p.metodo}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{formatPEN(Number(p.monto))}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {atencion.consultas && atencion.consultas.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Consultas</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {atencion.consultas.map((co) => {
                  const atendida = co.estado === "Atendida";
                  return (
                    <div key={co.id} className="flex items-center justify-between gap-2 rounded-xl border p-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-medium">
                          {co.tipoNombre}
                          {co.prenatal && <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">prenatal</span>}
                          <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `color-mix(in srgb, ${atendida ? "#16a34a" : "#f5a623"} 14%, transparent)`, color: atendida ? "#16a34a" : "#f5a623" }}>
                            {co.estado}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {co.especialista ? `${co.especialista.nombres} ${co.especialista.apellidos}` : "Sin especialista asignado"}
                        </p>
                      </div>
                      <Button asChild size="sm" variant={atendida ? "outline" : "default"} className={cn(!atendida && "bg-brand-gradient text-white")}>
                        <Link href={`/consultas/${co.id}/atender`}>{atendida ? "Ver" : "Atender"}</Link>
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {atencion.observaciones && (
            <Card>
              <CardHeader><CardTitle>Observaciones</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{atencion.observaciones}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <PatientHistory patient={atencion.paciente as unknown as Row} onCobro={refetch} />
        </div>
      </div>

      <CobroDialog
        open={cobroOpen}
        onOpenChange={setCobroOpen}
        atencionId={atencion.id}
        saldo={saldo}
        paciente={nombre}
        onDone={refetch}
      />
      <AnularDialog
        open={anularOpen}
        onOpenChange={setAnularOpen}
        path={`/atenciones/${atencion.id}/anular`}
        titulo="Anular atención"
        descripcion="La atención quedará anulada (no se elimina) y dejará de sumar en caja. Sus pagos también se anulan. Se guardará quién la anuló y el motivo."
        onDone={refetch}
      />
    </div>
  );
}
