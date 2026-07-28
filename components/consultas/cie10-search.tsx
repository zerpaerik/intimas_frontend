"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { type Cie10 } from "@/lib/api/consultas";

/** Combobox para buscar y elegir un código CIE-10. El menú se dibuja en un
 *  portal para que no lo recorte ninguna tarjeta y se vea la lista completa. */
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
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);

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

  // Posiciona el menú justo debajo del input (fixed) y lo sigue al hacer scroll.
  React.useEffect(() => {
    if (!open) return;
    const update = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const usarLibre = q.trim().length > 0 && !results.some((c) => c.codigo.toLowerCase() === q.trim().toLowerCase());

  const menu =
    open && pos && (results.length > 0 || q.trim().length > 0)
      ? createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 340), zIndex: 60 }}
            className="max-h-[24rem] overflow-auto rounded-lg border bg-popover p-1 shadow-lg"
          >
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
            {usarLibre && (
              <button
                type="button"
                onClick={() => { const code = q.trim().toUpperCase(); onSelect(code, ""); setQ(code); setOpen(false); }}
                className="mt-1 flex w-full items-center gap-2 rounded-md border-t px-2 pb-1.5 pt-2 text-left text-sm hover:bg-accent"
              >
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">Usar</span>
                <span className="text-muted-foreground">«{q.trim().toUpperCase()}» como código (Enter)</span>
              </button>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative" ref={wrapRef}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q.trim()) {
            e.preventDefault();
            const code = q.trim().toUpperCase();
            onSelect(code, "");
            setQ(code);
            setOpen(false);
          }
        }}
        placeholder="Buscar CIE-10 o escribe el código…"
        className="h-9 pl-8"
      />
      {menu}
    </div>
  );
}
