"use client";

import { Bell, Building2, Check, ChevronsUpDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "./command-palette";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";
import { useAuth, useCanSwitchSede, useSede } from "@/lib/auth/store";
import { SEDES } from "@/lib/auth/roles";

function SedeSwitcher() {
  const canSwitch = useCanSwitchSede();
  const sede = useSede();
  const verTodas = useAuth((s) => s.verTodas);
  const setSede = useAuth((s) => s.setSede);
  const setVerTodas = useAuth((s) => s.setVerTodas);
  const label = canSwitch && verTodas ? "Todas las sedes" : sede.name;

  if (!canSwitch) {
    return (
      <span className="hidden items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground md:inline-flex">
        <Building2 className="h-3.5 w-3.5 text-brand" />
        {label}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden h-8 gap-1.5 rounded-full px-3 text-xs font-medium md:inline-flex">
          <Building2 className="h-3.5 w-3.5 text-brand" />
          {label}
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Sede activa</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SEDES.map((s) => (
          <DropdownMenuItem key={s.id} onClick={() => setSede(s.id)}>
            <Check className={cn("h-4 w-4", !verTodas && sede.id === s.id ? "text-brand opacity-100" : "opacity-0")} />
            {s.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setVerTodas(true)}>
          <Check className={cn("h-4 w-4", verTodas ? "text-brand opacity-100" : "opacity-0")} />
          Todas las sedes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const NOTIFICATIONS = [
  { title: "Resultado de laboratorio listo", desc: "Hemograma — María Flores", time: "hace 5 min", color: "#00b8a9" },
  { title: "Nuevo paciente registrado", desc: "Recepción · Sede Principal", time: "hace 22 min", color: "#0091d5" },
  { title: "Cierre de caja pendiente", desc: "Turno tarde sin cerrar", time: "hace 1 h", color: "#f5a623" },
  { title: "Cumpleaños de profesional", desc: "Dr. Núñez cumple hoy", time: "hoy", color: "#e6007e" },
];

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <CommandPalette className="hidden w-full max-w-sm sm:flex" />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <SedeSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificaciones</span>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
                {NOTIFICATIONS.length} nuevas
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {NOTIFICATIONS.map((n) => (
              <DropdownMenuItem key={n.title} className="flex items-start gap-3 py-2.5">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: n.color }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                  {n.time}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
