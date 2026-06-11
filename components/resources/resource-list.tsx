"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatPEN, formatDate, calcAge, initials } from "@/lib/format";
import { getResource, endpointFor } from "@/lib/resources";
import type { ColumnDef as RColumn, Row } from "@/lib/resources/types";
import { api } from "@/lib/api/client";
import { useApiList } from "@/lib/api/hooks";

function CellValue({ column, row }: { column: RColumn; row: Row }) {
  const value = row[column.key];
  switch (column.type) {
    case "primary": {
      const sub = column.subKey ? row[column.subKey] : undefined;
      return (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient-soft text-xs font-bold text-brand">
            {initials(String(value ?? "?"))}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{String(value ?? "—")}</p>
            {sub != null && sub !== "" && (
              <p className="truncate text-xs text-muted-foreground">{String(sub)}</p>
            )}
          </div>
        </div>
      );
    }
    case "currency":
      return <span className="tabular-nums">{formatPEN(Number(value ?? 0))}</span>;
    case "percent":
      return <span className="tabular-nums">{Number(value ?? 0)}%</span>;
    case "date":
      return <span>{value ? formatDate(String(value)) : "—"}</span>;
    case "age":
      return <span>{value ? `${calcAge(String(value))} años` : "—"}</span>;
    case "badge": {
      const color = column.colorMap?.[String(value)] ?? "#64748b";
      return (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
        >
          {String(value ?? "—")}
        </span>
      );
    }
    case "tags": {
      const arr = Array.isArray(value) ? (value as unknown[]) : [];
      return (
        <div className="flex flex-wrap gap-1">
          {arr.slice(0, 2).map((t, i) => (
            <span key={i} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
              {typeof t === "object" && t ? String((t as { nombre?: string }).nombre) : String(t)}
            </span>
          ))}
          {arr.length > 2 && <span className="text-xs text-muted-foreground">+{arr.length - 2}</span>}
        </div>
      );
    }
    default:
      return <span>{value != null && value !== "" ? String(value) : "—"}</span>;
  }
}

export function ResourceList({ resourceKey }: { resourceKey: string }) {
  const router = useRouter();
  const cfg = getResource(resourceKey);
  const endpoint = cfg ? `/${endpointFor(cfg.key)}` : null;
  const { data: raw, loading, error, refetch } = useApiList<Row>(endpoint);

  const rows = React.useMemo(
    () => (cfg?.derive ? raw.map((r) => ({ ...r, ...cfg.derive!(r) })) : raw),
    [raw, cfg],
  );

  const [query, setQuery] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [target, setTarget] = React.useState<Row | null>(null);

  const filtered = React.useMemo(() => {
    if (!cfg || !query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      cfg.searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)),
    );
  }, [rows, query, cfg]);

  const columns = React.useMemo<ColumnDef<Row>[]>(() => {
    if (!cfg) return [];
    const cols: ColumnDef<Row>[] = cfg.columns.map((c) => ({
      accessorKey: c.key,
      header: ({ column }) => (
        <button
          className="inline-flex items-center gap-1 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {c.header}
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        </button>
      ),
      cell: ({ row }) => <CellValue column={c} row={row.original} />,
      meta: { hideOnMobile: c.hideOnMobile },
    }));
    cols.push({
      id: "_actions",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`${cfg.path}/${row.original.id}`)}>
                <Eye className="h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`${cfg.path}/${row.original.id}/editar`)}>
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setTarget(row.original)}>
                <Trash2 className="h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    });
    return cols;
  }, [cfg, router]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  async function confirmDelete() {
    if (!cfg || !target) return;
    try {
      await api.del(`${endpoint}/${target.id}`);
      toast.success(`${cfg.singular} eliminado`);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
    }
    setTarget(null);
  }

  if (!cfg) {
    return <div className="py-20 text-center text-muted-foreground">Recurso no encontrado.</div>;
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Archivo <span className="px-1">›</span>
        <span className="text-foreground">{cfg.plural}</span>
      </p>
      <PageHeader
        title={cfg.plural}
        description={cfg.description}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.info("Exportación disponible en la versión final.")}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button asChild className="bg-brand-gradient text-white">
              <Link href={`${cfg.path}/nuevo`}>
                <Plus className="h-4 w-4" />
                Nuevo
              </Link>
            </Button>
          </>
        }
      />

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center gap-3 border-b p-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Buscar ${cfg.plural.toLowerCase()}…`}
              className="pl-9"
            />
          </div>
          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} registro{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <TriangleAlert className="h-6 w-6 text-destructive" />
            No se pudo cargar la información.
            <span className="text-xs">{error}</span>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-1">
              Reintentar
            </Button>
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => {
                    const hide = (header.column.columnDef.meta as { hideOnMobile?: boolean })?.hideOnMobile;
                    return (
                      <TableHead key={header.id} className={cn("text-xs", hide && "hidden md:table-cell")}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    No se encontraron registros.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`${cfg.path}/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const hide = (cell.column.columnDef.meta as { hideOnMobile?: boolean })?.hideOnMobile;
                      return (
                        <TableCell key={cell.id} className={cn(hide && "hidden md:table-cell")}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {!loading && !error && table.getPageCount() > 1 && (
          <div className="flex items-center justify-between border-t p-3 text-sm">
            <span className="text-muted-foreground">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará{" "}
              <strong className="text-foreground">
                {target ? String(target[cfg.titleKey] ?? "este registro") : ""}
              </strong>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
