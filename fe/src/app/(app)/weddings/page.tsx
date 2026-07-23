"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, getActiveWeddingId, setActiveWedding, type Wedding } from "@/lib/api";
import { createWeddingSchema, type CreateWeddingValues } from "@/lib/schemas";
import { useServerPagination } from "@/hooks/useClientPagination";
import { useDataTable, type DataTableColumn } from "@/hooks/useDataTable";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  DataTableToolbar,
  SortableTableHead,
} from "@/components/ui/data-table-toolbar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const COLUMNS: DataTableColumn<Wedding>[] = [
  { id: "title", label: "Title", sortValue: (r) => r.title },
  { id: "slug", label: "Slug", sortValue: (r) => r.slug },
  { id: "date", label: "Date", sortValue: (r) => r.weddingDate },
  { id: "venue", label: "Venue", sortValue: (r) => r.venue },
  { id: "role", label: "Role", sortValue: (r) => r.membershipRole },
  { id: "actions", label: "Action", hideable: false, sortable: false },
];
export default function WeddingsPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    total,
    from,
    to,
    applyPage,
  } = useServerPagination();
  const table = useDataTable("weddings", COLUMNS, weddings);
  const visibleColCount = table.columns.filter((c) => table.isVisible(c.id)).length;
  const form = useForm<CreateWeddingValues>({
    resolver: zodResolver(createWeddingSchema),
    defaultValues: { title: "", weddingDate: "", venue: "" },
  });

  const load = useCallback(async () => {
    const result = await api.listWeddings({ page, size: pageSize });
    const list = applyPage(result);
    setWeddings(list);
    const activeId = getActiveWeddingId();
    const active = activeId ? list.find((w) => w.id === activeId) : null;
    if (active) setActiveWedding(active);
    else if (list[0] && !activeId) setActiveWedding(list[0]);
  }, [page, pageSize, applyPage]);

  useEffect(() => {
    load().catch((err) => {
      const msg = err instanceof Error ? err.message : "Failed";
      setError(msg);
      toast.error(msg);
    });
  }, [load]);

  async function onCreate(values: CreateWeddingValues) {
    setError(null);
    try {
      const created = await api.createWedding({
        title: values.title,
        venue: values.venue || undefined,
        weddingDate: values.weddingDate || undefined,
      });
      setActiveWedding(created);
      form.reset({ title: "", weddingDate: "", venue: "" });
      await load();
      toast.success("Wedding created");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Create failed";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Weddings</h1>
        <p className="mt-1 text-muted-foreground">
          Multi-wedding tenancy — create and switch contexts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create wedding</CardTitle>
          <CardDescription>Title is required. Date and venue are optional.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onCreate)}
              className="grid gap-4 sm:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Nimali & Kasun" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weddingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <FormControl>
                      <Input placeholder="Colombo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-sm text-destructive sm:col-span-2">{error}</p>
              )}
              <Button
                type="submit"
                className="sm:col-span-2"
                loading={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating…" : "Create wedding"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-xl">Your weddings</CardTitle>
            <CardDescription>{total} total</CardDescription>
          </div>
          <DataTableToolbar
            onRefresh={() => {
              void load();
            }}
            columns={table.columns as DataTableColumn<unknown>[]}
            isVisible={table.isVisible}
            onToggleColumn={table.toggleColumn}
          />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {table.isVisible("title") && (
                  <SortableTableHead
                    columnId="title"
                    label="Title"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("slug") && (
                  <SortableTableHead
                    columnId="slug"
                    label="Slug"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("date") && (
                  <SortableTableHead
                    columnId="date"
                    label="Date"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("venue") && (
                  <SortableTableHead
                    columnId="venue"
                    label="Venue"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("role") && (
                  <SortableTableHead
                    columnId="role"
                    label="Role"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("actions") && (
                  <SortableTableHead
                    columnId="actions"
                    label="Action"
                    sortable={false}
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                    className="text-right"
                  />
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.sortedRows.map((w) => (
                <TableRow key={w.id}>
                  {table.isVisible("title") && (
                    <TableCell className="font-medium">{w.title}</TableCell>
                  )}
                  {table.isVisible("slug") && (
                    <TableCell className="text-muted-foreground">/{w.slug}</TableCell>
                  )}
                  {table.isVisible("date") && (
                    <TableCell>{w.weddingDate ?? "—"}</TableCell>
                  )}
                  {table.isVisible("venue") && (
                    <TableCell>{w.venue ?? "—"}</TableCell>
                  )}
                  {table.isVisible("role") && (
                    <TableCell>
                      <Badge variant="secondary">{w.membershipRole}</Badge>
                    </TableCell>
                  )}
                  {table.isVisible("actions") && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/w/${w.slug}`} target="_blank">
                            Site
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveWedding(w);
                            toast.success(`Active wedding: ${w.title}`);
                          }}
                        >
                          Set active
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!total && (
                <TableRow>
                  <TableCell
                    colSpan={visibleColCount || 6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No weddings yet. Create one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            className="px-6 pb-4"
            page={page}
            totalPages={totalPages}
            total={total}
            from={from}
            to={to}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}
