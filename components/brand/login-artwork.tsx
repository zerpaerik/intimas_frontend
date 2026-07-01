import { Activity, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "./logo";

const features = [
  {
    icon: ShieldCheck,
    title: "Historia clínica segura",
    desc: "Pacientes, atenciones y resultados en un solo lugar.",
  },
  {
    icon: Building2,
    title: "Multisede",
    desc: "Todas tus sedes sincronizadas en tiempo real.",
  },
  {
    icon: Activity,
    title: "Indicadores en vivo",
    desc: "Ingresos, producción y comisiones al instante.",
  },
];

export function LoginArtwork() {
  return (
    <div className="relative hidden overflow-hidden bg-brand-gradient text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-14">
      {/* Capa decorativa */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* Glows */}
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-[#00b8a9]/25 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-[#7c3aed]/25 blur-3xl" />

        {/* Patrón de cruces médicas */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]">
          <defs>
            <pattern
              id="crosses"
              width="46"
              height="46"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(8)"
            >
              <path
                d="M21 14h4v7h7v4h-7v7h-4v-7h-7v-4h7z"
                fill="#ffffff"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crosses)" />
        </svg>

        {/* Arcos concéntricos */}
        <svg
          className="absolute -bottom-40 -right-40 h-[42rem] w-[42rem] opacity-30"
          viewBox="0 0 400 400"
          fill="none"
        >
          {[60, 110, 160, 200].map((r) => (
            <circle
              key={r}
              cx="200"
              cy="200"
              r={r}
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
          ))}
        </svg>

        {/* Línea de electrocardiograma */}
        <svg
          className="absolute bottom-44 left-0 w-full opacity-40"
          viewBox="0 0 600 80"
          fill="none"
          preserveAspectRatio="none"
        >
          <polyline
            points="0,40 120,40 150,40 165,12 185,68 205,40 320,40 345,40 360,20 378,60 396,40 600,40"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Encabezado */}
      <div className="relative z-10 flex items-center justify-between">
        <Logo tone="light" imgClassName="h-11" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm ring-1 ring-white/20">
          <Sparkles className="h-3.5 w-3.5" />
          Sistema clínico
        </span>
      </div>

      {/* Contenido central */}
      <div className="relative z-10 max-w-md">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          íntimas
        </p>
        <h1 className="font-heading text-4xl font-extrabold leading-tight xl:text-5xl">
          Cuidamos de ellas
          <br />y de ellos.
        </h1>
        <p className="mt-4 text-base text-white/80">
          La plataforma que une la gestión clínica, el laboratorio y las
          finanzas de tus consultorios en una sola experiencia.
        </p>

        <div className="mt-9 space-y-4">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold leading-tight">{f.title}</p>
                <p className="text-sm text-white/70">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pie */}
      <div className="relative z-10 flex items-center justify-between text-xs text-white/60">
        <span>© {new Date().getFullYear()} Policlínico Valmedic</span>
        <span>Lima · Perú</span>
      </div>
    </div>
  );
}
