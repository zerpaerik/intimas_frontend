"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, HandCoins, Search, TriangleAlert, Wallet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatPEN, formatDate, initials } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";
import { useSedeFiltro } from "@/lib/auth/store";
import { CobroDialog } from "@/components/atenciones/cobro-dialog";

interface CxcAtencion {
  id: number;
  fecha: string;
  total: number;
  pagado: number;
  saldo: number;
  paciente: { id: number; nombres: string; apellidos: string; numDoc?: string; telefono?: string };
}
interface CxcResponse {
  atenciones: CxcAtencion[];
  totalAdeudado: number;
  cantidad: number;
}

export function CuentasPorCobrar() {
  const router = useRouter();
  const sedeId = useSedeFiltro();
  const { data, loading, error, refetch } = useApiItem<CxcResponse>(`/reportes/cuentas-por-cobrar${sedeId ? `?sedeId=${sedeId}` : ""}`);
  const [query, setQuery] = React.useState("");
  const [cobro, setCobro] = React.useState<CxcAtencion | null>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = data?.atenciones ?? [];
    return !q
      ? list
      : list.filter((a) =>
          `${a.paciente?.nombres} ${a.paciente?.apellidos}`.toLowerCase().includes(q) ||
          String(a.paciente?.numDoc ?? "").toLowerCase().includes(q),
        );
  }, [data, query]);

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Movimientos <span className="px-1">›</span>
        <span className="text-foreground">Cuentas por Cobrar</span>
      </p>
      <PageHeader title="Cuentas por cobrar" description="Atenciones con saldo pendiente de pago." />

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "color-mix(in srgb, #ef4444 14%, transparent)", color: "#ef4444" }}>
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Total adeudado</p>
            <p className="font-heading text-2xl font-bold text-destructive">{formatPEN(Number(data?.totalAdeudado ?? 0))}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient-soft text-brand">
            <HandCoins className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Atenciones pendientes</p>
            <p className="font-heading text-2xl font-bold">{data?.cantidad ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center gap-3 border-b p-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar paciente…" className="h-9 pl-9" />
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <TriangleAlert className="h-6 w-6 text-destructive" />
            No se pudo cargar la información.
            <Button variant="outline" size="sm" onClick={refetch} className="mt-1">Reintentar</Button>
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No hay cuentas por cobrar. 🎉</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Paciente</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Fecha</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs text-right hidden md:table-cell">Pagado</TableHead>
                <TableHead className="text-xs text-right">Saldo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => {
                const nombre = `${a.paciente?.nombres ?? ""} ${a.paciente?.apellidos ?? ""}`.trim();
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft text-xs font-bold text-brand">
                          {initials(nombre)}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{nombre}</div>
                          <div className="text-xs text-muted-foreground">{a.paciente?.numDoc}{a.paciente?.telefono ? ` · 📞 ${a.paciente.telefono}` : ""}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(a.fecha)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPEN(Number(a.total))}</TableCell>
                    <TableCell className="text-right tabular-nums hidden md:table-cell text-success">{formatPEN(Number(a.pagado))}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold text-destructive">{formatPEN(Number(a.saldo))}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => router.push(`/movimientos/atenciones/${a.id}`)} aria-label="Ver">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="h-8 bg-brand-gradient text-white" onClick={() => setCobro(a)}>
                          <HandCoins className="h-4 w-4" /> Abonar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {cobro && (
        <CobroDialog
          open={!!cobro}
          onOpenChange={(o) => !o && setCobro(null)}
          atencionId={cobro.id}
          saldo={Number(cobro.saldo)}
          paciente={`${cobro.paciente?.nombres ?? ""} ${cobro.paciente?.apellidos ?? ""}`.trim()}
          onDone={() => { setCobro(null); refetch(); }}
        />
      )}
    </div>
  );
}
