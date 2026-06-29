"use client";

import Link from "next/link";
import {
  Activity, ArrowRight, Banknote, CalendarClock, ClipboardPlus,
  Receipt, Scale, Smartphone, Stethoscope, TrendingUp, UserRound, Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { AreaTrendChart, DonutChart, RankBarChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useSedeFiltro } from "@/lib/auth/store";
import { getRole } from "@/lib/auth/roles";
import { formatPEN, formatDateLong } from "@/lib/format";
import { useApiItem } from "@/lib/api/hooks";

interface Summary {
  kpisHoy: { efectivo: number; tarjeta: number; deposito: number; yape: number; total: number; gastos: number; neto: number; atenciones: number };
  ingresosPorDia: { dia: string; ingresos: number }[];
  atencionesPorDia: { dia: string; atenciones: number }[];
  metodosPago: { name: string; value: number; color: string }[];
  topServicios: { nombre: string; total: number }[];
  atencionesPorEstado: { name: string; value: number; color: string }[];
  actividadReciente: { titulo: string; detalle: string; hora: string; color: string }[];
  counts: { pacientes: number; profesionales: number; servicios: number; analisis: number; paquetes: number; atenciones: number };
}

const QUICK = [
  { label: "Nueva atención", href: "/movimientos/atenciones/nueva", icon: ClipboardPlus },
  { label: "Ver pacientes", href: "/archivos/pacientes", icon: UserRound },
  { label: "Atenciones", href: "/movimientos/atenciones", icon: CalendarClock },
  { label: "Servicios", href: "/archivos/servicios", icon: Activity },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buen día";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function DashboardPage() {
  const session = useAuth((s) => s.session);
  const nameParts = (session?.user.name ?? "").split(" ");
  const first = /^(dr|dra|lic|sr|sra|mg|ing)\.?$/i.test(nameParts[0] ?? "")
    ? `${nameParts[0]} ${nameParts[1] ?? ""}`.trim()
    : nameParts[0] ?? "";
  const roleId = session?.roleId ?? 1;
  const role = getRole(roleId);
  const isFinanzas = [1, 2, 12].includes(roleId);

  const sedeId = useSedeFiltro();
  const { data: s, loading } = useApiItem<Summary>(`/dashboard${sedeId ? `?sedeId=${sedeId}` : ""}`);

  const kpis = !s
    ? []
    : isFinanzas
      ? [
          { label: "Ingresos del día", value: formatPEN(s.kpisHoy.total), icon: Wallet, accent: "#00b8a9" },
          { label: "Gastos del día", value: formatPEN(s.kpisHoy.gastos), icon: Receipt, accent: "#ef4444" },
          { label: "Neto del día", value: formatPEN(s.kpisHoy.neto), icon: Scale, accent: s.kpisHoy.neto >= 0 ? "#16a34a" : "#ef4444" },
          { label: "Efectivo", value: formatPEN(s.kpisHoy.efectivo), icon: Banknote, accent: "#16a34a" },
          { label: "Yape", value: formatPEN(s.kpisHoy.yape), icon: Smartphone, accent: "#e6007e" },
          { label: "Atenciones hoy", value: String(s.kpisHoy.atenciones), icon: ClipboardPlus, accent: "#f5a623" },
        ]
      : [
          { label: "Atenciones hoy", value: String(s.kpisHoy.atenciones), icon: ClipboardPlus, accent: "#e6007e" },
          { label: "Atenciones totales", value: String(s.counts.atenciones), icon: CalendarClock, accent: "#0091d5" },
          { label: "Pacientes", value: String(s.counts.pacientes), icon: UserRound, accent: "#7c3aed" },
          { label: "Profesionales", value: String(s.counts.profesionales), icon: Stethoscope, accent: "#00b8a9" },
        ];

  const fmtLegend = (v: number) => (isFinanzas ? formatPEN(v) : new Intl.NumberFormat("es-PE").format(v));
  const donutData = isFinanzas ? s?.metodosPago ?? [] : s?.atencionesPorEstado ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={<span>{greeting()}, {first} 👋</span>}
        description={<span className="capitalize">{formatDateLong(new Date())}</span>}
        actions={
          <>
            <span className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white sm:inline-flex" style={{ backgroundColor: role.color }}>
              {role.name}
            </span>
            <Button asChild className="bg-brand-gradient text-white">
              <Link href="/movimientos/atenciones/nueva"><ClipboardPlus className="h-4 w-4" />Nueva atención</Link>
            </Button>
          </>
        }
      />

      {loading || !s ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </>
      ) : (
        <>
          <div className={isFinanzas ? "grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6" : "grid grid-cols-2 gap-4 lg:grid-cols-4"}>
            {kpis.map((k) => (
              <KpiCard key={k.label} label={k.label} value={k.value} icon={k.icon} accent={k.accent} />
            ))}
          </div>

          {/* Tendencia + dona */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{isFinanzas ? "Ingresos por día" : "Atenciones por día"}</CardTitle>
                <CardDescription>Últimos 14 días</CardDescription>
              </CardHeader>
              <CardContent>
                {isFinanzas ? (
                  <AreaTrendChart data={s.ingresosPorDia} xKey="dia" mode="money" series={[{ key: "ingresos", name: "Ingresos", color: "#e6007e" }]} />
                ) : (
                  <AreaTrendChart data={s.atencionesPorDia} xKey="dia" mode="count" series={[{ key: "atenciones", name: "Atenciones", color: "#7c3aed" }]} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isFinanzas ? "Métodos de pago" : "Atenciones por estado"}</CardTitle>
                <CardDescription>Hoy</CardDescription>
              </CardHeader>
              <CardContent>
                {donutData.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">Sin datos aún.</p>
                ) : (
                  <>
                    <DonutChart data={donutData} mode={isFinanzas ? "money" : "count"} />
                    <ul className="mt-4 space-y-2">
                      {donutData.map((p) => (
                        <li key={p.name} className="flex items-center gap-2 text-sm">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                          <span className="text-muted-foreground">{p.name}</span>
                          <span className="ml-auto font-semibold">{fmtLegend(p.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top servicios + actividad */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Servicios más solicitados</CardTitle>
                <CardDescription>Hoy · por número de atenciones</CardDescription>
              </CardHeader>
              <CardContent>
                {s.topServicios.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">Aún no hay servicios registrados en atenciones.</p>
                ) : (
                  <RankBarChart data={s.topServicios} labelKey="nombre" valueKey="total" unit="atenciones" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad reciente</CardTitle>
                <CardDescription>Últimas atenciones</CardDescription>
              </CardHeader>
              <CardContent>
                {s.actividadReciente.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Sin actividad reciente.</p>
                ) : (
                  <ol className="relative space-y-4 border-l border-border pl-5">
                    {s.actividadReciente.map((a, i) => (
                      <li key={i} className="relative">
                        <span className="absolute -left-[1.45rem] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-background" style={{ background: a.color }} />
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{a.titulo}</p>
                          <span className="shrink-0 text-xs text-muted-foreground">{a.hora}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{a.detalle}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Accesos rápidos */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold">
              <TrendingUp className="h-4 w-4 text-brand" />
              Accesos rápidos
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUICK.map((q) => (
                <Link key={q.label} href={q.href} className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient-soft text-brand">
                    <q.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold">{q.label}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
