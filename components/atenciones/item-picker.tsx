"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { formatPEN } from "@/lib/format";
import { useRows } from "@/lib/data/resource-store";

export interface CatalogItem {
  kind: string;
  nombre: string;
  precio: number;
}

const CONSULTAS: CatalogItem[] = [
  { kind: "Consulta", nombre: "Consulta ginecológica", precio: 60 },
  { kind: "Consulta", nombre: "Control prenatal", precio: 50 },
  { kind: "Consulta", nombre: "Consulta psiquiátrica", precio: 120 },
  { kind: "Consulta", nombre: "Medicina general", precio: 40 },
  { kind: "Consulta", nombre: "Nutrición", precio: 70 },
];

const METODOS: CatalogItem[] = [
  { kind: "Método", nombre: "Inyectable mensual", precio: 25 },
  { kind: "Método", nombre: "DIU (inserción)", precio: 150 },
  { kind: "Método", nombre: "Implante subdérmico", precio: 180 },
  { kind: "Método", nombre: "Píldoras (ciclo)", precio: 18 },
];

function Item({ item, onAdd }: { item: CatalogItem; onAdd: (i: CatalogItem) => void }) {
  return (
    <CommandItem value={`${item.kind} ${item.nombre}`} onSelect={() => onAdd(item)}>
      <span className="flex-1">{item.nombre}</span>
      <span className="text-xs font-medium tabular-nums text-muted-foreground">
        {formatPEN(item.precio)}
      </span>
    </CommandItem>
  );
}

export function ItemPicker({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdd: (item: CatalogItem) => void;
}) {
  const servicios = useRows("servicios");
  const analisis = useRows("analisis");
  const paquetes = useRows("paquetes");

  const add = (i: CatalogItem) => {
    onAdd(i);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Agregar ítem"
      description="Busca un servicio, análisis, paquete, consulta o método"
    >
      <CommandInput placeholder="Buscar en el catálogo…" />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
        <CommandGroup heading="Servicios">
          {servicios.map((s) => (
            <Item
              key={`s${s.id}`}
              item={{ kind: String(s.tipo ?? "Servicio"), nombre: String(s.nombre), precio: Number(s.precio) }}
              onAdd={add}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Análisis / Laboratorio">
          {analisis.map((a) => (
            <Item
              key={`a${a.id}`}
              item={{ kind: "Laboratorio", nombre: String(a.nombre), precio: Number(a.precio) }}
              onAdd={add}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Paquetes">
          {paquetes.map((p) => (
            <Item
              key={`p${p.id}`}
              item={{ kind: "Paquete", nombre: String(p.nombre), precio: Number(p.precio) }}
              onAdd={add}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Consultas / Controles">
          {CONSULTAS.map((c) => (
            <Item key={c.nombre} item={c} onAdd={add} />
          ))}
        </CommandGroup>
        <CommandGroup heading="Métodos anticonceptivos">
          {METODOS.map((m) => (
            <Item key={m.nombre} item={m} onAdd={add} />
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
