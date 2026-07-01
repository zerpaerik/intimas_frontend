import Image from "next/image";
import { cn } from "@/lib/utils";

type MarkVariant = "gradient" | "white" | "currentColor";

/**
 * Marca cuadrada (emblema abstracto) para espacios pequeños:
 * sidebar colapsado y loaders, donde el logo horizontal no cabe.
 */
export function LogoMark({
  className,
  variant = "gradient",
}: {
  className?: string;
  variant?: MarkVariant;
}) {
  const gradId = "valmedic-mark-grad";
  const badgeFill =
    variant === "gradient"
      ? `url(#${gradId})`
      : variant === "white"
        ? "rgba(255,255,255,0.16)"
        : "currentColor";
  const badgeStroke = variant === "white" ? "rgba(255,255,255,0.55)" : "none";

  return (
    <svg viewBox="0 0 64 64" className={cn("h-9 w-9", className)} role="img" aria-label="Valmedic" fill="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e6007e" />
          <stop offset="100%" stopColor="#0091d5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="19" fill={badgeFill} stroke={badgeStroke} strokeWidth="1.5" />
      {/* Cruz médica */}
      <g fill="#ffffff">
        <rect x="28" y="16" width="8" height="32" rx="2" />
        <rect x="16" y="28" width="32" height="8" rx="2" />
      </g>
    </svg>
  );
}

type LogoTone = "brand" | "light" | "dark";

/**
 * Logo principal de la marca (imagen a color "Policlínico Valmedic").
 * En fondos de color (tone="light") se enmarca en una tarjeta blanca
 * porque el archivo es JPEG (fondo blanco, sin transparencia).
 */
export function Logo({
  className,
  tone = "brand",
  subtitle,
  imgClassName,
}: {
  className?: string;
  tone?: LogoTone;
  subtitle?: string;
  imgClassName?: string;
}) {
  const onDark = tone === "light";
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className={cn("inline-flex w-fit items-center", onDark && "rounded-xl bg-white p-2 shadow-sm")}>
        <Image
          src="/brand/logo.jpeg"
          alt="Policlínico Valmedic"
          width={900}
          height={451}
          sizes="240px"
          className={cn("h-9 w-auto object-contain", imgClassName)}
        />
      </span>
      {subtitle && (
        <span className={cn("text-[10px] font-medium tracking-wide", onDark ? "text-white/70" : "text-muted-foreground")}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
