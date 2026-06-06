"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { LoginArtwork } from "@/components/brand/login-artwork";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth/store";
import {
  ROLES,
  SEDES,
  demoUserByEmail,
  getRole,
  type RoleId,
} from "@/lib/auth/roles";

const schema = z.object({
  email: z.string().min(1, "Ingresa tu correo").email("Correo no válido"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
  sedeId: z.string(),
  remember: z.boolean(),
});
type Values = z.infer<typeof schema>;

function nameFromEmail(email: string): string {
  const raw = email.split("@")[0].replace(/[._-]+/g, " ");
  return raw
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ");
}

export default function LoginPage() {
  const router = useRouter();
  const session = useAuth((s) => s.session);
  const hydrated = useAuth((s) => s.hydrated);
  const login = useAuth((s) => s.login);
  const loginAsRole = useAuth((s) => s.loginAsRole);
  const [showPw, setShowPw] = React.useState(false);

  React.useEffect(() => {
    if (hydrated && session) router.replace("/dashboard");
  }, [hydrated, session, router]);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", sedeId: "1", remember: true },
  });

  function onSubmit(v: Values) {
    const sedeId = Number(v.sedeId);
    const existing = demoUserByEmail(v.email);
    const user =
      existing ?? {
        id: 99,
        name: nameFromEmail(v.email) || "Usuario Demo",
        email: v.email,
        roleId: 1 as RoleId,
        title: "Administrador General",
      };
    login(user, sedeId);
    toast.success(`Bienvenido(a), ${user.name.split(" ")[0]}`);
    router.replace("/dashboard");
  }

  function quick(roleId: RoleId) {
    const sedeId = Number(getValues("sedeId")) || 1;
    loginAsRole(roleId, sedeId);
    toast.success(`Sesión demo · ${getRole(roleId).name}`);
    router.replace("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.1fr_1fr]">
      <LoginArtwork />

      <div className="relative flex flex-col items-center justify-center px-6 py-10 sm:px-10">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {/* Logo real de Intimas */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/brand/intimas-logo.png"
              alt="Intimas — Consultorios Médicos"
              width={823}
              height={274}
              priority
              className="h-auto w-[210px]"
            />
          </div>

          <div className="mb-7 text-center">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Inicia sesión
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder al panel de gestión.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tucorreo@intimas.pe"
                  className="pl-9"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="px-9"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Sede */}
            <div className="space-y-1.5">
              <Label htmlFor="sede">Sede</Label>
              <Controller
                control={control}
                name="sedeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="sede" className="w-full">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Selecciona una sede" />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {SEDES.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Recordar / recuperar */}
            <div className="flex items-center justify-between pt-1">
              <Controller
                control={control}
                name="remember"
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(!!v)}
                    />
                    Recordarme
                  </label>
                )}
              />
              <button
                type="button"
                onClick={() => toast.info("Función disponible en la versión final.")}
                className="text-sm font-medium text-brand-wine hover:underline dark:text-brand"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="group h-11 w-full bg-brand-gradient text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 hover:brightness-105"
            >
              Iniciar sesión
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </form>

          {/* Acceso rápido demo */}
          <div className="mt-8">
            <div className="relative mb-4 text-center">
              <span className="relative z-10 bg-background px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Acceso rápido (demo)
              </span>
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => quick(role.id)}
                  className="group flex items-center gap-2.5 rounded-xl border bg-card p-2.5 text-left transition-all hover:border-brand/40 hover:bg-accent/50 hover:shadow-sm"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: role.color }}
                  >
                    {role.short.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold leading-tight">
                      {role.short}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {role.name}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Mockup de demostración · cualquier correo y contraseña funcionan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
