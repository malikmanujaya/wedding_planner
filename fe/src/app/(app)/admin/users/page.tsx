"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import {
  api,
  getStoredUser,
  pageContent,
  type AdminUser,
  type PlatformRole,
} from "@/lib/api";
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
  email: "",
  fullName: "",
  password: "",
  roleCodes: ["USER"] as string[],
  active: true,
};

const COLUMNS: DataTableColumn<AdminUser>[] = [
  { id: "name", label: "Name", sortValue: (r) => r.fullName },
  { id: "email", label: "Email", sortValue: (r) => r.email },
  {
    id: "roles",
    label: "Roles",
    sortValue: (r) => r.roles.map((role) => role.code).join(","),
  },
  { id: "status", label: "Status", sortValue: (r) => r.active },
  { id: "actions", label: "Actions", hideable: false, sortable: false },
];

function isPlatformAdmin(roles: string[] | undefined) {
  return !!roles?.some((r) => r === "SUPER_ADMIN" || r === "ADMIN");
}

export default function AdminUsersPage() {
  const router = useRouter();
  const me = getStoredUser();
  const isSuperAdmin = me?.roles?.includes("SUPER_ADMIN") ?? false;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
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

  const table = useDataTable("admin-users", COLUMNS, users);
  const visibleColCount = table.columns.filter((c) => table.isVisible(c.id)).length;

  const assignableRoles = useMemo(
    () =>
      roles.filter((r) => {
        if (!r.active) return false;
        if (r.code === "SUPER_ADMIN" && !isSuperAdmin) return false;
        return true;
      }),
    [roles, isSuperAdmin]
  );

  const load = useCallback(async () => {
    try {
      const [u, r] = await Promise.all([
        api.listAdminUsers({ page, size: pageSize }),
        api.listAdminRoles(),
      ]);
      setUsers(applyPage(u));
      setRoles(pageContent(r));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, applyPage]);

  useEffect(() => {
    const user = getStoredUser();
    if (!isPlatformAdmin(user?.roles)) {
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

  function openEdit(user: AdminUser) {
    setEditing(user);
    setForm({
      email: user.email,
      fullName: user.fullName,
      password: "",
      roleCodes: user.roles.map((r) => r.code),
      active: user.active,
    });
    setOpen(true);
  }

  function toggleRole(code: string) {
    setForm((prev) => ({
      ...prev,
      roleCodes: prev.roleCodes.includes(code)
        ? prev.roleCodes.filter((c) => c !== code)
        : [...prev.roleCodes, code],
    }));
  }

  async function onSave() {
    if (!form.fullName.trim() || form.roleCodes.length === 0) {
      toast.error("Name and at least one role are required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.updateAdminUser(editing.id, {
          fullName: form.fullName.trim(),
          password: form.password.trim() || undefined,
          roleCodes: form.roleCodes,
          active: form.active,
        });
        toast.success("User updated");
      } else {
        if (!form.email.trim() || form.password.length < 6) {
          toast.error("Email and password (min 6) are required");
          setSaving(false);
          return;
        }
        await api.createAdminUser({
          email: form.email.trim(),
          fullName: form.fullName.trim(),
          password: form.password,
          roleCodes: form.roleCodes,
          active: form.active,
        });
        toast.success("User created");
      }
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(user: AdminUser) {
    if (!isSuperAdmin) return;
    if (!confirm(`Delete ${user.email}?`)) return;
    try {
      await api.deleteAdminUser(user.id);
      toast.success("User deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading users…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Users</h1>
          <p className="mt-1 text-muted-foreground">
            Platform accounts and their system / custom roles.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add user
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5" />
              All users
            </CardTitle>
            <CardDescription>{total} account(s)</CardDescription>
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
                {table.isVisible("name") && (
                  <SortableTableHead
                    columnId="name"
                    label="Name"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("email") && (
                  <SortableTableHead
                    columnId="email"
                    label="Email"
                    sortKey={table.sortKey}
                    sortDir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                )}
                {table.isVisible("roles") && (
                  <SortableTableHead
                    columnId="roles"
                    label="Roles"
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
              {table.sortedRows.map((user) => (
                <TableRow key={user.id}>
                  {table.isVisible("name") && (
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                  )}
                  {table.isVisible("email") && (
                    <TableCell>{user.email}</TableCell>
                  )}
                  {table.isVisible("roles") && (
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <Badge
                            key={r.id}
                            variant={r.systemRole ? "secondary" : "outline"}
                          >
                            {r.code}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  )}
                  {table.isVisible("status") && (
                    <TableCell>
                      <Badge variant={user.active ? "success" : "outline"}>
                        {user.active ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                  )}
                  {table.isVisible("actions") && (
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isSuperAdmin && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(user)}
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
                    No users yet.
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
            <DialogTitle>{editing ? "Edit user" : "Create user"}</DialogTitle>
            <DialogDescription>
              Assign one or more platform roles. Wedding membership roles are separate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {!editing && (
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium">Full name</label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Password {editing ? "(leave blank to keep)" : ""}
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Roles</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {assignableRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={form.roleCodes.includes(role.code)}
                      onChange={() => toggleRole(role.code)}
                    />
                    <span>
                      <span className="font-medium">{role.name}</span>
                      <span className="block text-xs text-muted-foreground">{role.code}</span>
                    </span>
                  </label>
                ))}
              </div>
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
                onCheckedChange={(active) => setForm((f) => ({ ...f, active }))}
                aria-label="Account status"
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
