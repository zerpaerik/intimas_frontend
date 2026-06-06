import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  accent: string;
  hint?: string;
}) {
  const positive = (delta ?? 0) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.18] blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative flex items-center justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
          }}
        >
          <Icon className="h-5 w-5" />
        </span>
        {delta !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              positive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="relative mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="relative mt-1 font-heading text-2xl font-bold tracking-tight">
        {value}
      </p>
      {hint && <p className="relative mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
