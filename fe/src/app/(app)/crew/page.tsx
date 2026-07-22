"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import {
  api,
  getActiveWeddingId,
  type Wedding,
  type WeddingMember,
} from "@/lib/api";
import {
  inviteCrewSchema,
  updateCrewSchema,
  type InviteCrewValues,
  type UpdateCrewValues,
} from "@/lib/schemas";
import { toast } from "@/components/ui/toast";
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

export default function CrewPage() {
  const [weddingId, setWeddingId] = useState<number | null>(null);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [crew, setCrew] = useState<WeddingMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<WeddingMember | null>(null);

  const inviteForm = useForm<InviteCrewValues>({
    resolver: zodResolver(inviteCrewSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "CREW",
      responsibilities: "",
    },
  });

  const editForm = useForm<UpdateCrewValues>({
    resolver: zodResolver(updateCrewSchema),
    defaultValues: { role: "CREW", responsibilities: "" },
  });

  const load = useCallback(async (id: number) => {
    const [crewList, weddings] = await Promise.all([
      api.listCrew(id),
      api.listWeddings(),
    ]);
    setCrew(crewList);
    setWedding(weddings.find((w) => w.id === id) ?? null);
  }, []);

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

  async function onInvite(values: InviteCrewValues) {
    if (!weddingId) return;
    setError(null);
    setInfo(null);
    try {
      const result = await api.inviteCrew(weddingId, {
        email: values.email,
        fullName: values.fullName || undefined,
        role: values.role,
        responsibilities: values.responsibilities || undefined,
      });
      setInviteOpen(false);
      inviteForm.reset({
        email: "",
        fullName: "",
        role: "CREW",
        responsibilities: "",
      });
      if (result.createdNewUser && result.tempPassword) {
        setInfo(
          `Invited ${result.member.fullName}. Temporary password: ${result.tempPassword}`
        );
        toast.success(`Invited ${result.member.fullName} (temp password created)`);
      } else {
        setInfo(`Added ${result.member.fullName} to the crew.`);
        toast.success(`Added ${result.member.fullName} to the crew`);
      }
      await load(weddingId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invite failed";
      setError(msg);
      toast.error(msg);
    }
  }

  function openEdit(member: WeddingMember) {
    setEditing(member);
    editForm.reset({
      role: member.role as UpdateCrewValues["role"],
      responsibilities: member.responsibilities ?? "",
    });
    setEditOpen(true);
  }

  async function onUpdate(values: UpdateCrewValues) {
    if (!weddingId || !editing) return;
    setError(null);
    try {
      await api.updateCrew(weddingId, editing.membershipId, {
        role: values.role,
        responsibilities: values.responsibilities || undefined,
      });
      setEditOpen(false);
      await load(weddingId);
      toast.success("Crew member updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setError(msg);
      toast.error(msg);
    }
  }

  async function onRemove(member: WeddingMember) {
    if (!weddingId) return;
    if (!window.confirm(`Remove ${member.fullName} from the crew?`)) return;
    setError(null);
    try {
      await api.removeCrew(weddingId, member.membershipId);
      await load(weddingId);
      toast.success("Crew member removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Remove failed";
      setError(msg);
      toast.error(msg);
    }
  }

  async function copyInvite() {
    if (!wedding?.inviteCode) return;
    const link = `${window.location.origin}/invite/${wedding.inviteCode}`;
    await navigator.clipboard.writeText(link);
    setInfo("Invite link copied to clipboard.");
    toast.success("Invite link copied");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl text-sm text-muted-foreground">Loading crew…</div>
    );
  }

  if (!weddingId) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="font-display text-3xl tracking-tight">Crew</h1>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Select a wedding first</CardTitle>
            <CardDescription>
              Activate a wedding to manage crew and responsibilities.
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
          <h1 className="font-display text-3xl tracking-tight">Crew</h1>
          <p className="mt-1 text-muted-foreground">
            People helping with{" "}
            <span className="font-medium text-foreground">
              {wedding?.title ?? "this wedding"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={copyInvite} disabled={!wedding?.inviteCode}>
            <Copy className="h-4 w-4" />
            Copy invite link
          </Button>
          <Button
            onClick={() => {
              setInviteOpen(true);
              setError(null);
            }}
          >
            <Plus className="h-4 w-4" />
            Invite member
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {info && (
        <p className="rounded-md border border-primary/20 bg-accent px-3 py-2 text-sm text-accent-foreground">
          {info}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UsersRound className="h-5 w-5" />
            Team
          </CardTitle>
          <CardDescription>
            {crew.length} member{crew.length === 1 ? "" : "s"}
            {wedding?.inviteCode ? ` · invite code ${wedding.inviteCode}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Responsibilities</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crew.map((member) => (
                <TableRow key={member.membershipId}>
                  <TableCell className="font-medium">{member.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{member.role}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate text-muted-foreground">
                    {member.responsibilities || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(member)}
                        aria-label="Edit member"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {member.role !== "OWNER" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onRemove(member)}
                          aria-label="Remove member"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!crew.length && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No crew yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite crew member</DialogTitle>
            <DialogDescription>
              Existing accounts are linked. New emails get a temporary password.
            </DialogDescription>
          </DialogHeader>
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(onInvite)} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="crew@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name (new users)</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional if they already have an account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="CREW">Crew</option>
                        <option value="COUPLE">Couple</option>
                        <option value="VENDOR">Vendor</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsibilities</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Guest check-in, vendor liaison" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={inviteForm.formState.isSubmitting}>
                  {inviteForm.formState.isSubmitting ? "Inviting…" : "Invite"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editing?.fullName}</DialogTitle>
            <DialogDescription>Update role and responsibilities.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="OWNER">Owner</option>
                        <option value="COUPLE">Couple</option>
                        <option value="CREW">Crew</option>
                        <option value="VENDOR">Vendor</option>
                        <option value="GUEST">Guest</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsibilities</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
