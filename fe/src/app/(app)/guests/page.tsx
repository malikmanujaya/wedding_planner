"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Pencil, Plus, Trash2, Upload } from "lucide-react";
import {
  api,
  getActiveWeddingId,
  type Guest,
  type Wedding,
} from "@/lib/api";
import { guestSchema, type GuestFormValues } from "@/lib/schemas";
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

const rsvpVariant: Record<Guest["rsvpStatus"], "outline" | "success" | "secondary" | "default"> = {
  PENDING: "outline",
  ACCEPTED: "success",
  DECLINED: "secondary",
  MAYBE: "default",
};

function emptyForm(): GuestFormValues {
  return {
    fullName: "",
    email: "",
    phone: "",
    household: "",
    mealPreference: "",
    rsvpStatus: "PENDING",
    tags: "",
    tableLabel: "",
    notes: "",
  };
}

function toPayload(values: GuestFormValues) {
  return {
    fullName: values.fullName,
    email: values.email || undefined,
    phone: values.phone || undefined,
    household: values.household || undefined,
    mealPreference: values.mealPreference || undefined,
    rsvpStatus: values.rsvpStatus,
    tags: values.tags || undefined,
    tableLabel: values.tableLabel || undefined,
    notes: values.notes || undefined,
  };
}

export default function GuestsPage() {
  const [weddingId, setWeddingId] = useState<number | null>(null);
  const [weddingTitle, setWeddingTitle] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [q, setQ] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: emptyForm(),
  });

  const load = useCallback(
    async (id: number, query = q, rsvp = rsvpFilter) => {
      const [list, weddings] = await Promise.all([
        api.listGuests(id, {
          q: query || undefined,
          rsvp: rsvp || undefined,
        }),
        api.listWeddings(),
      ]);
      setGuests(list);
      const active = weddings.find((w: Wedding) => w.id === id);
      setWeddingTitle(active?.title ?? `Wedding #${id}`);
    },
    [q, rsvpFilter]
  );

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

  const counts = useMemo(() => {
    const base = { PENDING: 0, ACCEPTED: 0, DECLINED: 0, MAYBE: 0 };
    for (const g of guests) base[g.rsvpStatus] += 1;
    return base;
  }, [guests]);

  function openCreate() {
    setEditing(null);
    form.reset(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(guest: Guest) {
    setEditing(guest);
    form.reset({
      fullName: guest.fullName,
      email: guest.email ?? "",
      phone: guest.phone ?? "",
      household: guest.household ?? "",
      mealPreference: guest.mealPreference ?? "",
      rsvpStatus: guest.rsvpStatus,
      tags: guest.tags ?? "",
      tableLabel: guest.tableLabel ?? "",
      notes: guest.notes ?? "",
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: GuestFormValues) {
    if (!weddingId) return;
    setError(null);
    try {
      const payload = toPayload(values);
      if (editing) await api.updateGuest(weddingId, editing.id, payload);
      else await api.createGuest(weddingId, payload);
      setDialogOpen(false);
      setSelected(new Set());
      await load(weddingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(guest: Guest) {
    if (!weddingId) return;
    if (!window.confirm(`Delete ${guest.fullName}?`)) return;
    try {
      await api.deleteGuest(weddingId, guest.id);
      await load(weddingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === guests.length) setSelected(new Set());
    else setSelected(new Set(guests.map((g) => g.id)));
  }

  async function bulkRsvp(status: Guest["rsvpStatus"]) {
    if (!weddingId || selected.size === 0) return;
    setError(null);
    try {
      await api.bulkUpdateGuestRsvp(weddingId, Array.from(selected), status);
      setSelected(new Set());
      await load(weddingId);
      setInfo(`Updated RSVP to ${status} for selected guests.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk update failed");
    }
  }

  async function onExport() {
    if (!weddingId) return;
    try {
      const csv = await api.exportGuestsCsv(weddingId);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "guests.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }

  async function onImport(file: File) {
    if (!weddingId) return;
    setError(null);
    try {
      const result = await api.importGuestsCsv(weddingId, file);
      setInfo(result.message);
      await load(weddingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl text-sm text-muted-foreground">Loading guests…</div>
    );
  }

  if (!weddingId) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="font-display text-3xl tracking-tight">Guests</h1>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Select a wedding first</CardTitle>
            <CardDescription>
              Activate a wedding to manage its guest list.
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
          <h1 className="font-display text-3xl tracking-tight">Guests</h1>
          <p className="mt-1 text-muted-foreground">
            Guest list for <span className="font-medium text-foreground">{weddingTitle}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImport(file);
              e.target.value = "";
            }}
          />
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add guest
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {info && (
        <p className="rounded-md border border-primary/20 bg-accent px-3 py-2 text-sm">
          {info}
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <span>Accepted {counts.ACCEPTED}</span>
        <span>· Pending {counts.PENDING}</span>
        <span>· Declined {counts.DECLINED}</span>
        <span>· Maybe {counts.MAYBE}</span>
      </div>

      <Card>
        <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-xl">Guest list</CardTitle>
            <CardDescription>{guests.length} shown</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search name, household, tags…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-56"
            />
            <Select
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value)}
              className="w-40"
            >
              <option value="">All RSVP</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
              <option value="MAYBE">Maybe</option>
            </Select>
            <Button
              variant="secondary"
              onClick={() => weddingId && load(weddingId, q, rsvpFilter)}
            >
              Apply
            </Button>
          </div>
        </CardHeader>
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t px-6 py-3 text-sm">
            <span>{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => bulkRsvp("ACCEPTED")}>
              Mark accepted
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkRsvp("DECLINED")}>
              Mark declined
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkRsvp("PENDING")}>
              Mark pending
            </Button>
          </div>
        )}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={guests.length > 0 && selected.size === guests.length}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Household</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Table</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(guest.id)}
                      onChange={() => toggleOne(guest.id)}
                      aria-label={`Select ${guest.fullName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{guest.fullName}</div>
                    <div className="text-xs text-muted-foreground">
                      {[guest.email, guest.phone].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </TableCell>
                  <TableCell>{guest.household ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={rsvpVariant[guest.rsvpStatus]}>{guest.rsvpStatus}</Badge>
                  </TableCell>
                  <TableCell>{guest.mealPreference ?? "—"}</TableCell>
                  <TableCell>{guest.tableLabel ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(guest)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDelete(guest)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!guests.length && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No guests yet. Add one or import a CSV.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit guest" : "Add guest"}</DialogTitle>
            <DialogDescription>
              Household, meal, RSVP, and table are ready for seating later.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="household"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Household</FormLabel>
                      <FormControl>
                        <Input placeholder="Perera family" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mealPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal</FormLabel>
                      <FormControl>
                        <Input placeholder="Veg / Chicken / Fish" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="rsvpStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RSVP</FormLabel>
                      <FormControl>
                        <Select {...field}>
                          <option value="PENDING">Pending</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="DECLINED">Declined</option>
                          <option value="MAYBE">Maybe</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tableLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Table</FormLabel>
                      <FormControl>
                        <Input placeholder="Table 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="family, VIP" {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Saving…"
                    : editing
                      ? "Save changes"
                      : "Add guest"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
