"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export type DataTableColumn<T> = {
  id: string;
  label: string;
  /** When false, column cannot be hidden. Default true. */
  hideable?: boolean;
  /** When false, header is not sortable. Default true. */
  sortable?: boolean;
  /** Extract sortable value from a row. */
  sortValue?: (row: T) => string | number | boolean | null | undefined;
  /** Default visibility. Default true. */
  defaultVisible?: boolean;
};

function loadVisibility(
  storageKey: string,
  columns: { id: string; defaultVisible?: boolean; hideable?: boolean }[]
): Record<string, boolean> {
  const defaults: Record<string, boolean> = {};
  for (const col of columns) {
    defaults[col.id] = col.defaultVisible !== false;
  }
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(`wp_table_cols:${storageKey}`);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function useDataTable<T>(
  storageKey: string,
  columns: DataTableColumn<T>[],
  rows: T[]
) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() =>
    loadVisibility(storageKey, columns)
  );
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    localStorage.setItem(`wp_table_cols:${storageKey}`, JSON.stringify(visibility));
  }, [storageKey, visibility]);

  const isVisible = useCallback(
    (id: string) => visibility[id] !== false,
    [visibility]
  );

  const toggleColumn = useCallback((id: string) => {
    setVisibility((prev) => ({ ...prev, [id]: !(prev[id] !== false) }));
  }, []);

  const toggleSort = useCallback((id: string) => {
    setSortKey((prev) => {
      if (prev !== id) {
        setSortDir("asc");
        return id;
      }
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return prev;
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortKey(null);
    setSortDir("asc");
  }, []);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.id === sortKey);
    if (!col?.sortValue) return rows;
    const get = col.sortValue;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      if (typeof av === "boolean" && typeof bv === "boolean") {
        return (Number(av) - Number(bv)) * dir;
      }
      return String(av).localeCompare(String(bv), undefined, { sensitivity: "base" }) * dir;
    });
  }, [rows, sortKey, sortDir, columns]);

  return {
    columns,
    visibility,
    isVisible,
    toggleColumn,
    sortKey,
    sortDir,
    toggleSort,
    clearSort,
    sortedRows,
  };
}
