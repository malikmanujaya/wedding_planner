"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { api, getStoredUser, type PlatformRole } from "@/lib/api";
import { useServerPagination } from "@/hooks/useClientPagination";
import { useDataTable, type DataTableColumn } from "@/hooks/useDataTable";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  DataTableToolbar,
  SortableTableHead,
} from "@/components/ui/data-table-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const emptyForm = {
  name: "",
  description: "",
  active: true,
};

const COLUMNS: DataTableColumn<PlatformRole>[] = [
  { id: "code", label: "Code", sortValue: (r) => r.code },
  { id: "name", label: "Name", sortValue: (r) => r.name },
  { id: "type", label: "Type", sortValue: (r) => r.systemRole },
  { id: "status", label: "Status", sortValue: (r) => r.active },
  { id: "actions", label: "Actions", hideable: false, sortable: false },
];
export default function AdminRolesPage() {
  const router = useRouter();
  const me = getStoredUser();
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformRole | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
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

  const table = useDataTable("admin-roles", COLUMNS, roles);
  const visibleColCount = table.columns.filter((c) => table.isVisible(c.id)).length;

  const load = useCallback(async () => {
    try {
      const result = await api.listAdminRoles({ page, size: pageSize });
      setRoles(applyPage(result));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, applyPage]);

  useEffect(() => {
    const user = getStoredUser();
    const userRoles = user?.roles ?? [];
    if (!userRoles.includes("SUPER_ADMIN") && !userRoles.includes("ADMIN")) {
      router.replace("/dashboard");
      return;
    }
    void load();
    // Intentionally once on mount — getStoredUser().roles is a new array each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(role: PlatformRole) {
    setEditing(role);
    setForm({
      name: role.name,
      description: role.description ?? "",
      active: role.active,
    });
    setOpen(true);
  }

  async function onSave() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.updateAdminRole(editing.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          active: form.active,
        });
        toast.success("Role updated");
      } else {
        await api.createAdminRole({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          active: form.active,
        });
        toast.success("Role created");
      }
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(role: PlatformRole) {
    if (role.systemRole) return;
    if (!confirm(`Delete role ${role.code}?`)) return;
    try {
      await api.deleteAdminRole(role.id);
      toast.success("Role deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading roles…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Roles</h1>
          <p className="mt-1 text-muted-foreground">
            System roles are seeded. Create custom roles for your org.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Custom role
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5" />
              Platform roles
            </CardTitle>
            <CardDescription>
              SUPER_ADMIN, ADMIN, USER, VENDOR are system roles. Custom role codes are
              generated automatically.
            </CardDescription>
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {table.isVisible("code") && (
                  <SortableTableHead
                    columnId="code"
                    label="Code"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("name") && (
                  <SortableTableHead
                    columnId="name"
                    label="Name"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("type") && (
                  <SortableTableHead
                    columnId="type"
                    label="Type"
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
                {table.isVisible("actions") && (
                  <SortableTableHead
                    columnId="actions"
                    label=""
                    sortable={false}
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                    className="w-[100px]"
                  />
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.sortedRows.map((role) => (
                <TableRow key={role.id}>
                  {table.isVisible("code") && (
                    <TableCell className="font-mono text-sm">{role.code}</TableCell>
                  )}
                  {table.isVisible("name") && (
                    <TableCell>
                      <div>
                        <p className="font-medium">{role.name}</p>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {table.isVisible("type") && (
                    <TableCell>
                      <Badge variant={role.systemRole ? "secondary" : "outline"}>
                        {role.systemRole ? "System" : "Custom"}
                      </Badge>
                    </TableCell>
                  )}
                  {table.isVisible("status") && (
                    <TableCell>
                      <Badge variant={role.active ? "success" : "outline"}>
                        {role.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  )}
                  {table.isVisible("actions") && (
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(role)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!role.systemRole && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(role)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
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
                    No roles yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            className="pt-4"
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit role" : "Create custom role"}</DialogTitle>
            <DialogDescription>
              {editing
                ? `Code ${editing.code} is fixed. Update name, description, or status.`
                : "A unique code is generated from the name (e.g. Wedding Planner → WEDDING_PLANNER)."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {editing && (
              <div>
                <label className="mb-1 block text-sm font-medium">Code</label>
                <Input value={editing.code} disabled readOnly className="font-mono" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Wedding Planner"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-xs text-muted-foreground">
                  {form.active ? "Active" : "Inactive"}
                </p>
              </div>
              <Switch
                checked={form.active}
                disabled={editing?.code === "SUPER_ADMIN"}
                onCheckedChange={(active) => setForm((f) => ({ ...f, active }))}
                aria-label="Role status"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" loading={saving} onClick={onSave}>
              {saving ? "Saving…" : editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
