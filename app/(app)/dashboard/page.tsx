"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  AreaTrendChart,
  DonutChart,
  RankBarChart,
} from "@/components/dashboard/charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/store";
import { getRole } from "@/lib/auth/roles";
import { formatPEN, formatDateLong } from "@/lib/format";
import { dashboardFor } from "@/lib/data/dashboards";

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
  const cfg = dashboardFor(roleId);
  const Primary = cfg.primary.icon;

  const fmtLegend = (v: number) =>
    cfg.donut.mode === "money" ? formatPEN(v) : new Intl.NumberFormat("es-PE").format(v);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span>
            {greeting()}, {first} 👋
          </span>
        }
        description={<span className="capitalize">{formatDateLong(new Date())}</span>}
        actions={
          <>
            <span
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white sm:inline-flex"
              style={{ backgroundColor: role.color }}
            >
              {role.name}
            </span>
            <Button asChild className="bg-brand-gradient text-white">
              <Link href={cfg.primary.href}>
                <Primary className="h-4 w-4" />
                {cfg.primary.label}
              </Link>
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div
        className={cn(
          "grid grid-cols-2 gap-4",
          cfg.kpis.length === 6 ? "lg:grid-cols-3 xl:grid-cols-6" : "lg:grid-cols-4",
        )}
      >
        {cfg.kpis.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            delta={k.delta}
            icon={k.icon}
            accent={k.accent}
            hint={k.hint}
          />
        ))}
      </div>

      {/* Tendencia + dona */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>{cfg.area.title}</CardTitle>
                <CardDescription>{cfg.area.subtitle}</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs">
                {cfg.area.series.map((s) => (
                  <span key={s.key} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AreaTrendChart
              data={cfg.area.data}
              xKey={cfg.area.xKey}
              series={cfg.area.series}
              mode={cfg.area.mode}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{cfg.donut.title}</CardTitle>
            <CardDescription>{cfg.donut.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={cfg.donut.data} mode={cfg.donut.mode} />
            <ul className="mt-4 space-y-2">
              {cfg.donut.data.map((p) => (
                <li key={p.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-muted-foreground">{p.name}</span>
                  <span className="ml-auto font-semibold">{fmtLegend(p.value)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Ranking + pendientes */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{cfg.bar.title}</CardTitle>
            <CardDescription>{cfg.bar.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <RankBarChart
              data={cfg.bar.data}
              labelKey={cfg.bar.labelKey}
              valueKey={cfg.bar.valueKey}
              unit={cfg.bar.unit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{cfg.pendientes.titulo}</CardTitle>
            <CardDescription>Resumen según tu rol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cfg.pendientes.items.map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actividad + accesos */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{cfg.activity.title}</CardTitle>
            <CardDescription>Movimientos de hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l border-border pl-5">
              {cfg.activity.items.map((a) => (
                <li key={a.titulo + a.hora} className="relative">
                  <span
                    className="absolute -left-[1.45rem] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-background"
                    style={{ background: a.color }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{a.titulo}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{a.hora}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.detalle}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" />
              Accesos rápidos
            </CardTitle>
            <CardDescription>Lo más usado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {cfg.quick.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.label}
                  href={q.href}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition-all hover:border-brand/40 hover:bg-accent/40"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient-soft text-brand">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="text-sm font-semibold">{q.label}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
