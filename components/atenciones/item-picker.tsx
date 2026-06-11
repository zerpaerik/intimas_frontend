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
import { useApiList } from "@/lib/api/hooks";
import type { Row } from "@/lib/resources/types";

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

function Item({
  item,
  uid,
  onAdd,
}: {
  item: CatalogItem;
  uid: string;
  onAdd: (i: CatalogItem) => void;
}) {
  return (
    <CommandItem value={`${item.nombre} ${item.kind} ${uid}`} onSelect={() => onAdd(item)}>
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
  const servicios = useApiList<Row>("/servicios");
  const analisis = useApiList<Row>("/analisis");
  const paquetes = useApiList<Row>("/paquetes");

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
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>Sin resultados.</CommandEmpty>
        <CommandGroup heading="Servicios">
          {servicios.data.map((s) => (
            <Item
              key={`s${s.id}`}
              uid={`s${s.id}`}
              item={{ kind: String(s.tipo ?? "Servicio"), nombre: String(s.nombre), precio: Number(s.precio) }}
              onAdd={add}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Análisis / Laboratorio">
          {analisis.data.map((a) => (
            <Item
              key={`a${a.id}`}
              uid={`a${a.id}`}
              item={{ kind: "Laboratorio", nombre: String(a.nombre), precio: Number(a.precio) }}
              onAdd={add}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Paquetes">
          {paquetes.data.map((p) => (
            <Item
              key={`p${p.id}`}
              uid={`p${p.id}`}
              item={{ kind: "Paquete", nombre: String(p.nombre), precio: Number(p.precio) }}
              onAdd={add}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Consultas / Controles">
          {CONSULTAS.map((c, i) => (
            <Item key={c.nombre} uid={`c${i}`} item={c} onAdd={add} />
          ))}
        </CommandGroup>
        <CommandGroup heading="Métodos anticonceptivos">
          {METODOS.map((m, i) => (
            <Item key={m.nombre} uid={`m${i}`} item={m} onAdd={add} />
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
