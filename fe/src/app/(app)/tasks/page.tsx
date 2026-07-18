"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  api,
  getActiveWeddingId,
  type ChecklistTask,
  type Wedding,
  type WeddingMember,
} from "@/lib/api";
import { taskSchema, type TaskFormValues } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
  TableHead,
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

  const load = useCallback(async (id: number) => {
    const [taskList, memberList, weddings] = await Promise.all([
      api.listTasks(id),
      api.listMembers(id),
      api.listWeddings(),
    ]);
    setTasks(taskList);
    setMembers(memberList);
    const active = weddings.find((w: Wedding) => w.id === id);
    setWeddingTitle(active?.title ?? `Wedding #${id}`);
  }, []);

  useEffect(() => {
    const id = getActiveWeddingId();
    if (!id) {
      setLoading(false);
      return;
    }
    setWeddingId(id);
    load(id)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(task: ChecklistTask) {
    if (!weddingId) return;
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setError(null);
    try {
      await api.deleteTask(weddingId, task.id);
      await load(weddingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
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
        <CardHeader>
          <CardTitle className="text-xl">Checklist</CardTitle>
          <CardDescription>{tasks.length} task{tasks.length === 1 ? "" : "s"}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-medium">{task.title}</div>
                    {task.notes && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {task.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[task.status]}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.dueDate ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.assigneeName ?? "—"}
                  </TableCell>
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
                </TableRow>
              ))}
              {!tasks.length && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No tasks yet. Add your first checklist item.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
                        {members.map((m) => (
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
                <Button type="submit" disabled={form.formState.isSubmitting}>
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
