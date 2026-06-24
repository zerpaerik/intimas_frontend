"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { SelectOption } from "@/lib/resources/types";

/**
 * Combobox que permite elegir una opción existente o crear/escribir una nueva.
 * - Modo texto: `onCreate` devuelve { value: texto, label: texto } (se guarda el texto).
 * - Modo catálogo (FK): `onCreate` crea el registro en el maestro y devuelve { value: id, label }.
 */
export function CreatableCombobox({
  value,
  onChange,
  options,
  placeholder = "Selecciona o escribe…",
  onCreate,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  onCreate: (label: string) => Promise<SelectOption>;
  invalid?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [extra, setExtra] = React.useState<SelectOption[]>([]);

  const allOptions = React.useMemo(() => {
    const seen = new Set<string>();
    return [...options, ...extra].filter((o) => (seen.has(o.value) ? false : (seen.add(o.value), true)));
  }, [options, extra]);

  const current = allOptions.find((o) => o.value === value);
  const display = current?.label ?? (value || "");
  const q = query.trim();
  const exact = allOptions.some((o) => o.label.toLowerCase() === q.toLowerCase());

  async function create() {
    if (!q || creating) return;
    setCreating(true);
    try {
      const opt = await onCreate(q);
      setExtra((p) => [...p, opt]);
      onChange(opt.value);
      setQuery("");
      setOpen(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn("h-10 w-full justify-between font-normal", !display && "text-muted-foreground")}
        >
          <span className="truncate">{display || placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar o escribir nuevo…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {allOptions.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label}
                  onSelect={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                >
                  <Check className={cn("h-4 w-4", value === o.value ? "opacity-100 text-brand" : "opacity-0")} />
                  {o.label}
                </CommandItem>
              ))}
              {q && !exact && (
                <CommandItem value={`__crear__ ${q}`} onSelect={create} className="text-brand">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Crear «{q}»
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
