"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  api,
  getActiveWedding,
  getActiveWeddingId,
  type ChecklistTask,
  type WeddingMember,
} from "@/lib/api";
import { taskSchema, type TaskFormValues } from "@/lib/schemas";
import { useServerPagination } from "@/hooks/useClientPagination";
import { useDataTable, type DataTableColumn } from "@/hooks/useDataTable";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COLUMNS: DataTableColumn<ChecklistTask>[] = [
  { id: "title", label: "Task", sortValue: (r) => r.title },
  { id: "status", label: "Status", sortValue: (r) => r.status },
  { id: "dueDate", label: "Due", sortValue: (r) => r.dueDate },
  { id: "assignee", label: "Assignee", sortValue: (r) => r.assigneeName },
  { id: "actions", label: "Actions", hideable: false, sortable: false },
];

const statusVariant: Record<
  ChecklistTask["status"],
  "outline" | "secondary" | "success"
> = {
  TODO: "outline",
  IN_PROGRESS: "secondary",
  DONE: "success",
};

function toPayload(values: TaskFormValues) {
  return {
    title: values.title,
    notes: values.notes?.trim() ? values.notes.trim() : undefined,
    status: values.status,
    dueDate: values.dueDate ? values.dueDate : undefined,
    assigneeUserId:
      values.assigneeUserId && values.assigneeUserId !== ""
        ? Number(values.assigneeUserId)
        : null,
  };
}

export default function TasksPage() {
  const [weddingId, setWeddingId] = useState<number | null>(null);
  const [weddingTitle, setWeddingTitle] = useState<string>("");
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [members, setMembers] = useState<WeddingMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ChecklistTask | null>(null);
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

  const table = useDataTable("tasks", COLUMNS, tasks ?? []);
  const visibleColCount = table.columns.filter((c) => table.isVisible(c.id)).length;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      notes: "",
      status: "TODO",
      dueDate: "",
      assigneeUserId: "",
    },
  });

  const load = useCallback(
    async (id: number) => {
      const [taskPage, memberList] = await Promise.all([
        api.listTasks(id, { page, size: pageSize }),
        api.listMembers(id),
      ]);
      setTasks(applyPage(taskPage));
      setMembers(Array.isArray(memberList) ? memberList : []);
      const active = getActiveWedding();
      setWeddingTitle(active?.id === id ? active.title : `Wedding #${id}`);
    },
    [page, pageSize, applyPage]
  );

  useEffect(() => {
    const id = getActiveWeddingId();
    if (!id) {
      setLoading(false);
      return;
    }
    setWeddingId(id);
    load(id)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [load]);

  function openCreate() {
    setEditing(null);
    form.reset({
      title: "",
      notes: "",
      status: "TODO",
      dueDate: "",
      assigneeUserId: "",
    });
    setDialogOpen(true);
  }

  function openEdit(task: ChecklistTask) {
    setEditing(task);
    form.reset({
      title: task.title,
      notes: task.notes ?? "",
      status: task.status,
      dueDate: task.dueDate ?? "",
      assigneeUserId: task.assigneeUserId ? String(task.assigneeUserId) : "",
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: TaskFormValues) {
    if (!weddingId) return;
    setError(null);
    try {
      const payload = toPayload(values);
      if (editing) {
        await api.updateTask(weddingId, editing.id, payload);
      } else {
        await api.createTask(weddingId, payload);
      }
      setDialogOpen(false);
      await load(weddingId);
      toast.success(editing ? "Task updated" : "Task added");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setError(msg);
      toast.error(msg);
    }
  }

  async function onDelete(task: ChecklistTask) {
    if (!weddingId) return;
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setError(null);
    try {
      await api.deleteTask(weddingId, task.id);
      await load(weddingId);
      toast.success("Task deleted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setError(msg);
      toast.error(msg);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl text-sm text-muted-foreground">Loading tasks…</div>
    );
  }

  if (!weddingId) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="font-display text-3xl tracking-tight">Tasks</h1>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Select a wedding first</CardTitle>
            <CardDescription>
              Create or activate a wedding, then manage its checklist here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/weddings">Go to weddings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Tasks</h1>
          <p className="mt-1 text-muted-foreground">
            Checklist for <span className="font-medium text-foreground">{weddingTitle}</span>
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-xl">Checklist</CardTitle>
            <CardDescription>{total} task{total === 1 ? "" : "s"}</CardDescription>
          </div>
          <DataTableToolbar
            onRefresh={() => {
              if (weddingId) void load(weddingId);
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
                    label="Task"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("status") && (
                  <SortableTableHead
                    columnId="status"
                    label="Status"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("dueDate") && (
                  <SortableTableHead
                    columnId="dueDate"
                    label="Due"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("assignee") && (
                  <SortableTableHead
                    columnId="assignee"
                    label="Assignee"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("actions") && (
                  <SortableTableHead
                    columnId="actions"
                    label="Actions"
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
              {table.sortedRows.map((task) => (
                <TableRow key={task.id}>
                  {table.isVisible("title") && (
                    <TableCell>
                      <div className="font-medium">{task.title}</div>
                      {task.notes && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {task.notes}
                        </p>
                      )}
                    </TableCell>
                  )}
                  {table.isVisible("status") && (
                    <TableCell>
                      <Badge variant={statusVariant[task.status]}>
                        {task.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  )}
                  {table.isVisible("dueDate") && (
                    <TableCell>{task.dueDate ?? "—"}</TableCell>
                  )}
                  {table.isVisible("assignee") && (
                    <TableCell className="text-muted-foreground">
                      {task.assigneeName ?? "—"}
                    </TableCell>
                  )}
                  {table.isVisible("actions") && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(task)}
                          aria-label="Edit task"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(task)}
                          aria-label="Delete task"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!total && (
                <TableRow>
                  <TableCell
                    colSpan={visibleColCount || 5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No tasks yet. Add your first checklist item.
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit task" : "Add task"}</DialogTitle>
            <DialogDescription>
              Status, due date, and assignee are optional helpers for your crew.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Book venue deposit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select {...field}>
                          <option value="TODO">Todo</option>
                          <option value="IN_PROGRESS">In progress</option>
                          <option value="DONE">Done</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="assigneeUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="">Unassigned</option>
                        {(members ?? []).map((m) => (
                          <option key={m.userId} value={String(m.userId)}>
                            {m.fullName} ({m.role})
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Saving…"
                    : editing
                      ? "Save changes"
                      : "Create task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
