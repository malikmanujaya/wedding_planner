"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableHead } from "@/components/ui/table";
import type { DataTableColumn, SortDir } from "@/hooks/useDataTable";
import { cn } from "@/lib/utils";

type DataTableToolbarProps = {
  onRefresh: () => void;
  refreshing?: boolean;
  columns: DataTableColumn<unknown>[];
  isVisible: (id: string) => boolean;
  onToggleColumn: (id: string) => void;
  className?: string;
};

export function DataTableToolbar({
  onRefresh,
  refreshing = false,
  columns,
  isVisible,
  onToggleColumn,
  className,
}: DataTableToolbarProps) {
  const hideable = columns.filter((c) => c.hideable !== false);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8"
        onClick={onRefresh}
        disabled={refreshing}
      >
        <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
        Refresh
      </Button>

      {hideable.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="h-8">
              <Columns3 className="h-3.5 w-3.5" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[12rem]">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hideable.map((col) => {
              const on = isVisible(col.id);
              return (
                <DropdownMenuItem
                  key={col.id}
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    onToggleColumn(col.id);
                  }}
                >
                  <span
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                    )}
                  >
                    {on ? "✓" : null}
                  </span>
                  {col.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

type SortableTableHeadProps = {
  columnId: string;
  label: string;
  sortable?: boolean;
  sortKey: string | null;
  sortDir: SortDir;
  onSort: (columnId: string) => void;
  className?: string;
};

export function SortableTableHead({
  columnId,
  label,
  sortable = true,
  sortKey,
  sortDir,
  onSort,
  className,
}: SortableTableHeadProps) {
  if (!sortable) {
    return <TableHead className={className}>{label}</TableHead>;
  }

  const active = sortKey === columnId;
  const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;

  return (
    <TableHead className={className}>
      <button
        type="button"
        className={cn(
          "-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors hover:bg-muted/80",
          active && "text-foreground"
        )}
        onClick={() => onSort(columnId)}
      >
        {label}
        <Icon className={cn("h-3.5 w-3.5", active ? "opacity-100" : "opacity-40")} />
      </button>
    </TableHead>
  );
}
