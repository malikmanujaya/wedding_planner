"use client";

import { useCallback, useMemo, useState } from "react";
import { pageContent, type PageResponse } from "@/lib/api";

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export function useServerPagination(initialPageSize: number = DEFAULT_PAGE_SIZE) {
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const setPage = useCallback((next: number) => {
    setPageState(Math.max(1, next));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPageState(1);
  }, []);

  /** Accepts PageResponse or a legacy bare array. Always returns an array. */
  const applyPage = useCallback(
    <T,>(result: PageResponse<T> | T[] | null | undefined): T[] => {
      if (Array.isArray(result)) {
        setTotalElements(result.length);
        setTotalPages(1);
        return result;
      }
      if (result && typeof result === "object") {
        setTotalElements(result.totalElements ?? 0);
        setTotalPages(Math.max(1, result.totalPages ?? 1));
      } else {
        setTotalElements(0);
        setTotalPages(1);
      }
      return pageContent(result);
    },
    []
  );

  const from = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalElements);

  return useMemo(
    () => ({
      page,
      setPage,
      pageSize,
      setPageSize,
      total: totalElements,
      totalPages,
      from,
      to,
      applyPage,
    }),
    [page, setPage, pageSize, setPageSize, totalElements, totalPages, from, to, applyPage]
  );
}
