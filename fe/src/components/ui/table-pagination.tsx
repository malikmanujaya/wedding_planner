"use client";

import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PAGE_SIZE_OPTIONS } from "@/hooks/useClientPagination";
import { cn } from "@/lib/utils";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
  /** Hide when there are no rows. */
  hideWhenEmpty?: boolean;
};

export function TablePagination({
  page,
  totalPages,
  total,
  from,
  to,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className,
  hideWhenEmpty = true,
}: TablePaginationProps) {
  if (hideWhenEmpty && total === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t px-1 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="whitespace-nowrap tabular-nums">
          Showing{" "}
          <span className="font-medium text-foreground">
            {from}–{to}
          </span>{" "}
          of <span className="font-medium text-foreground">{total}</span>
        </p>

        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap leading-none">Rows per page</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 min-w-[3.75rem] justify-between gap-1.5 px-2.5 font-normal tabular-nums"
                aria-label="Rows per page"
              >
                {pageSize}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[7.5rem] p-1">
              {pageSizeOptions.map((size) => (
                <DropdownMenuItem
                  key={size}
                  className="cursor-pointer justify-between gap-3"
                  onSelect={() => onPageSizeChange(size)}
                >
                  <span className="tabular-nums">{size}</span>
                  {size === pageSize ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <span className="h-3.5 w-3.5" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <span className="min-w-[5.5rem] text-center tabular-nums leading-none">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
