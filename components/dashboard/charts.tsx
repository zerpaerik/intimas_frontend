"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPEN } from "@/lib/format";

export type ValueMode = "money" | "count";

function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

function fmt(v: number, mode: ValueMode) {
  return mode === "money" ? formatPEN(v) : new Intl.NumberFormat("es-PE").format(v);
}

export interface Serie {
  key: string;
  name: string;
  color: string;
}

function SeriesTooltip({
  active,
  payload,
  label,
  mode,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: { color?: string } }>;
  label?: string;
  mode: ValueMode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((p, i) => {
        const color = p.color ?? p.payload?.color;
        return (
          <p key={i} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
            <span className="text-foreground">{p.name}:</span>
            <span className="font-semibold text-foreground">{fmt(p.value ?? 0, mode)}</span>
          </p>
        );
      })}
    </div>
  );
}

export function AreaTrendChart({
  data,
  xKey,
  series,
  mode = "count",
  height = 260,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: Serie[];
  mode?: ValueMode;
  height?: number;
}) {
  const mounted = useMounted();
  const uid = React.useId().replace(/:/g, "");
  if (!mounted) return <Skeleton className="w-full rounded-xl" style={{ height }} />;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis hide />
          <Tooltip content={<SeriesTooltip mode={mode} />} cursor={{ stroke: "var(--border)" }} />
          {series.map((s, i) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              fill={`url(#${uid}-${i})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
  mode = "count",
  height = 220,
}: {
  data: { name: string; value: number; color: string }[];
  mode?: ValueMode;
  height?: number;
}) {
  const mounted = useMounted();
  const total = data.reduce((a, b) => a + b.value, 0);
  if (!mounted) return <Skeleton className="w-full rounded-xl" style={{ height }} />;
  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2} strokeWidth={2}>
            {data.map((s) => (
              <Cell key={s.name} fill={s.color} stroke="var(--card)" />
            ))}
          </Pie>
          <Tooltip content={<SeriesTooltip mode={mode} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="font-heading text-lg font-bold">{fmt(total, mode)}</span>
      </div>
    </div>
  );
}

function BarTooltip({
  active,
  payload,
  labelKey,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: Record<string, unknown> }>;
  labelKey: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold">{String(p.payload?.[labelKey] ?? "")}</p>
      <p className="text-muted-foreground">
        {p.value} {unit}
      </p>
    </div>
  );
}

export function RankBarChart({
  data,
  labelKey,
  valueKey,
  unit,
  height = 260,
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  unit: string;
  height?: number;
}) {
  const mounted = useMounted();
  const uid = React.useId().replace(/:/g, "");
  if (!mounted) return <Skeleton className="w-full rounded-xl" style={{ height }} />;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
          <defs>
            <linearGradient id={`${uid}-bar`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e6007e" />
              <stop offset="100%" stopColor="#0091d5" />
            </linearGradient>
          </defs>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey={labelKey}
            width={150}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            cursor={{ fill: "color-mix(in srgb, var(--muted) 60%, transparent)" }}
            content={<BarTooltip labelKey={labelKey} unit={unit} />}
          />
          <Bar dataKey={valueKey} radius={[0, 6, 6, 0]} fill={`url(#${uid}-bar)`} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
