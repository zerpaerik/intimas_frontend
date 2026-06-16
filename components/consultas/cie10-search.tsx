"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { type Cie10 } from "@/lib/api/consultas";

/** Combobox para buscar y elegir un código CIE-10. */
export function Cie10Search({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (codigo: string, descripcion: string) => void;
}) {
  const [q, setQ] = React.useState(value ?? "");
  const [open, setOpen] = React.useState(false);
  const [results, setResults] = React.useState<Cie10[]>([]);
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { setQ(value ?? ""); }, [value]);

  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      try {
        const r = await api.get<Cie10[]>(`/cie10?search=${encodeURIComponent(q)}`);
        setResults(r ?? []);
      } catch {
        setResults([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q, open]);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar CIE-10…"
        className="h-9 pl-8"
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-64 w-[min(28rem,90vw)] overflow-auto rounded-lg border bg-popover p-1 shadow-md">
          {results.map((c) => (
            <button
              key={c.codigo}
              type="button"
              onClick={() => { onSelect(c.codigo, c.descripcion); setQ(c.codigo); setOpen(false); }}
              className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <span className="shrink-0 rounded bg-brand/10 px-1.5 py-0.5 text-xs font-medium text-brand">{c.codigo}</span>
              <span className="text-muted-foreground">{c.descripcion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
