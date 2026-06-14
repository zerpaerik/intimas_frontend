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
  /** Metadatos cuando es una consulta (kind === "Consulta"). */
  tipoConsultaId?: number;
  prenatal?: boolean;
  especialidad?: string;
}

const METODOS: CatalogItem[] = [
  { kind: "Método", nombre: "Inyectable mensual", precio: 25 },
  { kind: "Método", nombre: "DIU (inserción)", precio: 150 },
  { kind: "Método", nombre: "Implante subdérmico", precio: 180 },
  { kind: "Método", nombre: "Píldoras (ciclo)", precio: 18 },
];

function Item({
  value,
  label,
  precio,
  onSelect,
}: {
  value: string;
  label: string;
  precio: number;
  onSelect: () => void;
}) {
  return (
    <CommandItem value={value} onSelect={onSelect}>
      <span className="flex-1">{label}</span>
      <span className="text-xs font-medium tabular-nums text-muted-foreground">{formatPEN(precio)}</span>
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
  const tiposConsulta = useApiList<Row>("/tipos-consulta");

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
              value={`${s.nombre} servicio s${s.id}`}
              label={String(s.nombre)}
              precio={Number(s.precio)}
              onSelect={() => add({ kind: String(s.tipo ?? "Servicio"), nombre: String(s.nombre), precio: Number(s.precio) })}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Análisis / Laboratorio">
          {analisis.data.map((a) => (
            <Item
              key={`a${a.id}`}
              value={`${a.nombre} laboratorio a${a.id}`}
              label={String(a.nombre)}
              precio={Number(a.precio)}
              onSelect={() => add({ kind: "Laboratorio", nombre: String(a.nombre), precio: Number(a.precio) })}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Paquetes">
          {paquetes.data.map((p) => (
            <Item
              key={`p${p.id}`}
              value={`${p.nombre} paquete p${p.id}`}
              label={String(p.nombre)}
              precio={Number(p.precio)}
              onSelect={() => add({ kind: "Paquete", nombre: String(p.nombre), precio: Number(p.precio) })}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Consultas / Controles">
          {tiposConsulta.data.map((t) => (
            <Item
              key={`t${t.id}`}
              value={`${t.nombre} consulta ${t.especialidad ?? ""} t${t.id}`}
              label={String(t.nombre)}
              precio={Number(t.precio)}
              onSelect={() =>
                add({
                  kind: "Consulta",
                  nombre: String(t.nombre),
                  precio: Number(t.precio),
                  tipoConsultaId: Number(t.id),
                  prenatal: Boolean(t.prenatal),
                  especialidad: t.especialidad ? String(t.especialidad) : undefined,
                })
              }
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Métodos anticonceptivos">
          {METODOS.map((m, i) => (
            <Item key={m.nombre} value={`${m.nombre} metodo m${i}`} label={m.nombre} precio={m.precio} onSelect={() => add(m)} />
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
