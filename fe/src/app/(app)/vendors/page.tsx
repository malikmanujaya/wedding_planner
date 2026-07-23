"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Pencil, Plus, Store, Trash2, Undo2 } from "lucide-react";
import {
  api,
  getActiveWedding,
  getActiveWeddingId,
  type VendorPayment,
  type WeddingVendor,
} from "@/lib/api";
import { vendorSchema, type VendorFormValues } from "@/lib/schemas";
import { useServerPagination } from "@/hooks/useClientPagination";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
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

const CATEGORIES: WeddingVendor["category"][] = [
  "DJ",
  "BAND",
  "ASHTAKA",
  "PHOTOGRAPHER",
  "VIDEOGRAPHER",
  "CATERER",
  "FLORIST",
  "DECORATOR",
  "MAKEUP",
  "TRANSPORT",
  "VENUE",
  "OTHER",
];

const statusVariant: Record<
  WeddingVendor["status"],
  "outline" | "secondary" | "success" | "default"
> = {
  PENDING: "outline",
  CONTACTED: "secondary",
  BOOKED: "default",
  CONFIRMED: "success",
  CANCELLED: "outline",
};

const paymentVariant: Record<
  VendorPayment["status"],
  "outline" | "secondary" | "success" | "destructive"
> = {
  PENDING: "secondary",
  PAID: "success",
  OVERDUE: "destructive",
};

function emptyForm(): VendorFormValues {
  return {
    name: "",
    category: "DJ",
    status: "PENDING",
    contactName: "",
    email: "",
    phone: "",
    quotedAmount: "",
    advanceAmount: "",
    advanceDueDate: "",
    remainingDueDate: "",
    notes: "",
  };
}

function parseMoney(value?: string) {
  if (!value || value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toPayload(values: VendorFormValues) {
  return {
    name: values.name,
    category: values.category,
    status: values.status,
    contactName: values.contactName || undefined,
    email: values.email || undefined,
    phone: values.phone || undefined,
    quotedAmount: parseMoney(values.quotedAmount),
    advanceAmount: parseMoney(values.advanceAmount),
    advanceDueDate: values.advanceDueDate || null,
    remainingDueDate: values.remainingDueDate || null,
    notes: values.notes || undefined,
  };
}

function formatAmount(value: number | null | undefined) {
  if (value == null) return "—";
  return `LKR ${value.toLocaleString("en-LK")}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function advanceFromVendor(vendor: WeddingVendor) {
  const advance = vendor.payments?.find((p) => p.label.toLowerCase() === "advance");
  return {
    amount: advance?.amount ?? vendor.advanceAmount ?? null,
    dueDate: advance?.dueDate ?? "",
  };
}

function remainingDueFromVendor(vendor: WeddingVendor) {
  const remaining = vendor.payments?.find(
    (p) => p.label.toLowerCase() === "remaining balance"
  );
  return remaining?.dueDate ?? vendor.nextDueDate ?? "";
}

export default function VendorsPage() {
  const [weddingId, setWeddingId] = useState<number | null>(null);
  const [weddingTitle, setWeddingTitle] = useState("");
  const [vendors, setVendors] = useState<WeddingVendor[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [editing, setEditing] = useState<WeddingVendor | null>(null);
  const [paymentsVendor, setPaymentsVendor] = useState<WeddingVendor | null>(null);
  const [paymentBusy, setPaymentBusy] = useState<number | null>(null);
  const qRef = useRef(q);
  const categoryRef = useRef(category);
  qRef.current = q;
  categoryRef.current = category;
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

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: emptyForm(),
  });

  const load = useCallback(
    async (id: number) => {
      const result = await api.listVendors(id, {
        q: qRef.current || undefined,
        category: categoryRef.current || undefined,
        page,
        size: pageSize,
      });
      const list = applyPage(result);
      setVendors(list);
      const active = getActiveWedding();
      setWeddingTitle(active?.id === id ? active.title : `Wedding #${id}`);
      setPaymentsVendor((prev) => {
        if (!prev) return prev;
        return list.find((v) => v.id === prev.id) ?? prev;
      });
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

  function applyFilters() {
    if (!weddingId) return;
    if (page !== 1) {
      setPage(1);
      return;
    }
    load(weddingId).catch((err) => {
      const msg = err instanceof Error ? err.message : "Failed to load";
      setError(msg);
      toast.error(msg);
    });
  }

  function openCreate() {
    setEditing(null);
    form.reset(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(vendor: WeddingVendor) {
    setEditing(vendor);
    const advance = advanceFromVendor(vendor);
    form.reset({
      name: vendor.name,
      category: vendor.category,
      status: vendor.status,
      contactName: vendor.contactName ?? "",
      email: vendor.email ?? "",
      phone: vendor.phone ?? "",
      quotedAmount: vendor.quotedAmount != null ? String(vendor.quotedAmount) : "",
      advanceAmount: advance.amount != null ? String(advance.amount) : "",
      advanceDueDate: advance.dueDate || "",
      remainingDueDate: remainingDueFromVendor(vendor) || "",
      notes: vendor.notes ?? "",
    });
    setDialogOpen(true);
  }

  function openPayments(vendor: WeddingVendor) {
    setPaymentsVendor(vendor);
    setPaymentsOpen(true);
  }

  async function onSubmit(values: VendorFormValues) {
    if (!weddingId) return;
    setError(null);
    try {
      const payload = toPayload(values);
      if (editing) await api.updateVendor(weddingId, editing.id, payload);
      else await api.createVendor(weddingId, payload);
      setDialogOpen(false);
      await load(weddingId);
      toast.success(editing ? "Vendor updated" : "Vendor added");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setError(msg);
      toast.error(msg);
    }
  }

  async function onDelete(vendor: WeddingVendor) {
    if (!weddingId) return;
    if (!window.confirm(`Remove ${vendor.name}?`)) return;
    try {
      await api.deleteVendor(weddingId, vendor.id);
      await load(weddingId);
      toast.success("Vendor removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setError(msg);
      toast.error(msg);
    }
  }

  async function togglePayment(payment: VendorPayment) {
    if (!weddingId || !paymentsVendor) return;
    setPaymentBusy(payment.id);
    setError(null);
    try {
      if (payment.status === "PAID") {
        await api.markVendorPaymentPending(weddingId, paymentsVendor.id, payment.id);
        toast.success("Payment marked pending");
      } else {
        await api.markVendorPaymentPaid(weddingId, paymentsVendor.id, payment.id);
        toast.success("Payment marked paid");
      }
      await load(weddingId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment update failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setPaymentBusy(null);
    }
  }

  const outstanding = vendors.reduce((sum, v) => sum + (v.remainingAmount ?? 0), 0);
  const overdueCount = vendors.reduce(
    (count, v) => count + (v.payments?.filter((p) => p.status === "OVERDUE").length ?? 0),
    0
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl text-sm text-muted-foreground">Loading vendors…</div>
    );
  }

  if (!weddingId) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="font-display text-3xl tracking-tight">Vendors</h1>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Select a wedding first</CardTitle>
            <CardDescription>
              Activate a wedding to track DJ, Band, Ashtaka, and other vendors.
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
          <h1 className="font-display text-3xl tracking-tight">Vendors</h1>
          <p className="mt-1 text-muted-foreground">
            Wedding-scoped vendors for{" "}
            <span className="font-medium text-foreground">{weddingTitle}</span>
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add vendor
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Remaining to pay</CardDescription>
            <CardTitle className="text-2xl">{formatAmount(outstanding)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overdue installments</CardDescription>
            <CardTitle className="text-2xl">{overdueCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Store className="h-5 w-5" />
              Vendor list
            </CardTitle>
            <CardDescription>
              {total} vendor{total === 1 ? "" : "s"} · advance + remaining due
              dates
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search name or contact…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-52"
            />
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-44"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Button variant="secondary" onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Paid / Remaining</TableHead>
                <TableHead>Next due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div className="font-medium">{vendor.name}</div>
                    {vendor.notes && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {vendor.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{vendor.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[vendor.status]}>{vendor.status}</Badge>
                  </TableCell>
                  <TableCell>{formatAmount(vendor.quotedAmount)}</TableCell>
                  <TableCell className="text-sm">
                    <div>{formatAmount(vendor.totalPaid)}</div>
                    <div
                      className={
                        (vendor.remainingAmount ?? 0) > 0
                          ? "text-xs text-muted-foreground"
                          : "text-xs text-emerald-700"
                      }
                    >
                      {(vendor.remainingAmount ?? 0) > 0
                        ? `${formatAmount(vendor.remainingAmount)} left`
                        : "Settled"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {vendor.nextDueDate ? (
                      <span
                        className={
                          vendor.payments?.some((p) => p.status === "OVERDUE")
                            ? "text-destructive"
                            : ""
                        }
                      >
                        {formatDate(vendor.nextDueDate)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => openPayments(vendor)}>
                        Payments
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(vendor)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDelete(vendor)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!total && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No vendors yet. Add DJ, Band, Ashtaka, and set advance + remaining dues.
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit vendor" : "Add vendor"}</DialogTitle>
            <DialogDescription>
              Set quoted total, advance, and remaining due dates. Mark installments paid from
              Payments.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor name</FormLabel>
                    <FormControl>
                      <Input placeholder="RAWDS / Enchanted Flowers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select {...field}>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select {...field}>
                          <option value="PENDING">Pending</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="BOOKED">Booked</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact name</FormLabel>
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
              </div>
              <FormField
                control={form.control}
                name="quotedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quoted amount (LKR)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="advanceAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance (LKR)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="advanceDueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance due</FormLabel>
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
                name="remainingDueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remaining balance due</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                      <Input placeholder="Deposit due, arrival time…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Saving…"
                    : editing
                      ? "Save changes"
                      : "Add vendor"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentsOpen} onOpenChange={setPaymentsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {paymentsVendor ? `${paymentsVendor.name} payments` : "Payments"}
            </DialogTitle>
            <DialogDescription>
              Mark advance and remaining installments as paid. Overdue shows when past due date.
            </DialogDescription>
          </DialogHeader>
          {paymentsVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Quoted</p>
                  <p className="font-medium">{formatAmount(paymentsVendor.quotedAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paid</p>
                  <p className="font-medium">{formatAmount(paymentsVendor.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-medium">{formatAmount(paymentsVendor.remainingAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Next due</p>
                  <p className="font-medium">{formatDate(paymentsVendor.nextDueDate)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {(paymentsVendor.payments ?? []).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{payment.label}</span>
                        <Badge variant={paymentVariant[payment.status]}>{payment.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatAmount(payment.amount)}
                        {payment.dueDate ? ` · due ${formatDate(payment.dueDate)}` : ""}
                        {payment.paidDate ? ` · paid ${formatDate(payment.paidDate)}` : ""}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={payment.status === "PAID" ? "outline" : "default"}
                      disabled={paymentBusy === payment.id}
                      onClick={() => togglePayment(payment)}
                    >
                      {payment.status === "PAID" ? (
                        <>
                          <Undo2 className="h-3.5 w-3.5" />
                          Undo
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark paid
                        </>
                      )}
                    </Button>
                  </div>
                ))}
                {!(paymentsVendor.payments ?? []).length && (
                  <p className="text-sm text-muted-foreground">
                    No payment schedule yet. Edit the vendor and set quote / advance / due dates.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
