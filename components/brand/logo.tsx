import { cn } from "@/lib/utils";

type MarkVariant = "gradient" | "white" | "currentColor";

/**
 * Emblema Intimas: badge "squircle" con la dualidad "Él y Ella"
 * (dos figuras unidas) — evoca el logo original de los consultorios.
 */
export function LogoMark({
  className,
  variant = "gradient",
}: {
  className?: string;
  variant?: MarkVariant;
}) {
  const gradId = "intimas-mark-grad";
  const badgeFill =
    variant === "gradient"
      ? `url(#${gradId})`
      : variant === "white"
        ? "rgba(255,255,255,0.16)"
        : "currentColor";
  const badgeStroke = variant === "white" ? "rgba(255,255,255,0.55)" : "none";
  const figureFill = variant === "gradient" ? "#ffffff" : variant === "white" ? "#ffffff" : "#ffffff";

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-9 w-9", className)}
      role="img"
      aria-label="Intimas"
      fill="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e6007e" />
          <stop offset="100%" stopColor="#0091d5" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="19"
        fill={badgeFill}
        stroke={badgeStroke}
        strokeWidth="1.5"
      />
      <g fill={figureFill}>
        {/* Ella */}
        <circle cx="24" cy="24" r="7.2" opacity="0.96" />
        {/* Él */}
        <circle cx="40" cy="24" r="7.2" />
        {/* Cuerpos unidos */}
        <path
          d="M15 50c0-11 7.4-15.5 17-15.5S49 39 49 50c0 1.5-1 2.2-2.2 2.2H17.2C16 52.2 15 51.5 15 50Z"
          opacity="0.96"
        />
      </g>
    </svg>
  );
}

type LogoTone = "brand" | "light" | "dark";

/**
 * Logo completo: emblema + wordmark "Intimas" y subtítulo opcional.
 */
export function Logo({
  className,
  tone = "brand",
  showWordmark = true,
  subtitle,
  markClassName,
}: {
  className?: string;
  tone?: LogoTone;
  showWordmark?: boolean;
  subtitle?: string;
  markClassName?: string;
}) {
  const markVariant: MarkVariant = tone === "light" ? "white" : "gradient";
  const wordClass =
    tone === "brand"
      ? "text-brand-gradient"
      : tone === "light"
        ? "text-white"
        : "text-foreground";
  const subClass = tone === "light" ? "text-white/70" : "text-muted-foreground";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark variant={markVariant} className={markClassName} />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-heading text-xl font-extrabold tracking-tight",
              wordClass,
            )}
          >
            Intimas
          </span>
          {subtitle && (
            <span className={cn("text-[10px] font-medium tracking-wide", subClass)}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
