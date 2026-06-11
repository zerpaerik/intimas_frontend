"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Check, ChevronsUpDown, LogOut, UserCog } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/store";
import { ROLES, SEDES, getRole, getSede, type RoleId } from "@/lib/auth/roles";
import { initials } from "@/lib/format";

export function UserMenu() {
  const router = useRouter();
  const session = useAuth((s) => s.session);
  const switchRole = useAuth((s) => s.switchRole);
  const setSede = useAuth((s) => s.setSede);
  const logout = useAuth((s) => s.logout);

  if (!session) return null;
  const role = getRole(session.roleId);
  const sede = getSede(session.sedeId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-2 px-1.5 py-1.5 sm:px-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className="text-xs font-bold text-white"
              style={{ backgroundColor: role.color }}
            >
              {initials(session.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left leading-tight md:block">
            <p className="max-w-[10rem] truncate text-sm font-semibold">
              {session.user.name}
            </p>
            <p className="text-xs text-muted-foreground">{role.short}</p>
          </div>
          <ChevronsUpDown className="hidden h-4 w-4 text-muted-foreground md:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback
              className="text-xs font-bold text-white"
              style={{ backgroundColor: role.color }}
            >
              {initials(session.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{session.user.name}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserCog className="h-4 w-4" />
            Cambiar rol (demo)
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-60">
            <DropdownMenuRadioGroup
              value={String(session.roleId)}
              onValueChange={async (v) => {
                const id = Number(v) as RoleId;
                try {
                  await switchRole(id);
                  toast.success(`Ahora ves el sistema como ${getRole(id).name}`);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "No se pudo cambiar de rol");
                }
              }}
            >
              {ROLES.map((r) => (
                <DropdownMenuRadioItem key={r.id} value={String(r.id)}>
                  <span
                    className="mr-1 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  {r.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Building2 className="h-4 w-4" />
            Sede: {sede.short}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52">
            <DropdownMenuRadioGroup
              value={String(session.sedeId)}
              onValueChange={(v) => {
                setSede(Number(v));
                toast.success(`Sede activa: ${getSede(Number(v)).name}`);
              }}
            >
              {SEDES.map((s) => (
                <DropdownMenuRadioItem key={s.id} value={String(s.id)}>
                  {s.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            logout();
            toast.success("Sesión cerrada");
            router.replace("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
