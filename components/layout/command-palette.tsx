"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { navForRole } from "@/lib/nav";
import { useAuth } from "@/lib/auth/store";
import { cn } from "@/lib/utils";

export function CommandPalette({ className }: { className?: string }) {
  const router = useRouter();
  const roleId = useAuth((s) => s.session?.roleId ?? 1);
  const [open, setOpen] = React.useState(false);
  const groups = navForRole(roleId);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted",
          className,
        )}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Buscar módulo…</span>
        <kbd className="pointer-events-none hidden select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Busca un módulo o sección…" />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group.id} heading={group.label ?? "General"}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    value={`${group.label ?? ""} ${item.label}`}
                    onSelect={() => go(item.href)}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
