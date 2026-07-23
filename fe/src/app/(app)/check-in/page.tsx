"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ScanLine, Search, XCircle } from "lucide-react";
import {
  api,
  getActiveWedding,
  getActiveWeddingId,
  setActiveWedding,
  type CheckInGuest,
  type Wedding,
} from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckInPage() {
  const [weddingId, setWeddingId] = useState<number | null>(null);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [q, setQ] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [results, setResults] = useState<CheckInGuest[]>([]);
  const [stats, setStats] = useState({
    totalGuests: 0,
    admitted: 0,
    rejected: 0,
    notArrived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const refreshStats = useCallback(async (id: number) => {
    const s = await api.checkInStats(id);
    setStats(s);
  }, []);

  const loadWedding = useCallback(async (id: number) => {
    const cached = getActiveWedding();
    if (cached?.id === id) {
      setWedding(cached);
    } else {
      const weddings = await api.listWeddings();
      const active = weddings.find((w) => w.id === id) ?? null;
      if (active) setActiveWedding(active);
      setWedding(active);
    }
    await refreshStats(id);
  }, [refreshStats]);

  useEffect(() => {
    const id = getActiveWeddingId();
    if (!id) {
      setLoading(false);
      return;
    }
    setWeddingId(id);
    loadWedding(id)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [loadWedding]);

  async function searchByName() {
    if (!weddingId) return;
    try {
      const list = await api.lookupCheckIn(weddingId, { q: q.trim() || undefined });
      setResults(list);
      if (!list.length) toast.info("No guests matched");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lookup failed");
    }
  }

  async function searchByToken() {
    if (!weddingId || !tokenInput.trim()) return;
    try {
      const list = await api.lookupCheckIn(weddingId, { token: tokenInput.trim() });
      setResults(list);
      if (!list.length) toast.error("Invite token not found for this wedding");
      else toast.success(`Found ${list[0].fullName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lookup failed");
    }
  }

  async function act(guest: CheckInGuest, action: "ADMITTED" | "REJECTED" | "NOT_ARRIVED") {
    if (!weddingId) return;
    setBusyId(guest.id);
    try {
      const updated = await api.checkInGuest(weddingId, guest.id, action);
      setResults((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      await refreshStats(weddingId);
      toast.success(
        action === "ADMITTED"
          ? `Admitted ${guest.fullName}`
          : action === "REJECTED"
            ? `Rejected ${guest.fullName}`
            : `Reset ${guest.fullName}`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl text-sm text-muted-foreground">Loading check-in…</div>
    );
  }

  if (!weddingId) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="font-display text-3xl tracking-tight">Check-in</h1>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Select a wedding first</CardTitle>
            <CardDescription>Activate a wedding to run entrance check-in.</CardDescription>
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Check-in</h1>
        <p className="mt-1 text-muted-foreground">
          Entrance desk for{" "}
          <span className="font-medium text-foreground">{wedding?.title}</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Guests</CardDescription>
            <CardTitle className="text-2xl">{stats.totalGuests}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Admitted</CardDescription>
            <CardTitle className="text-2xl text-[hsl(162_40%_30%)]">{stats.admitted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-2xl text-destructive">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Not arrived</CardDescription>
            <CardTitle className="text-2xl">{stats.notArrived}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {wedding?.slug && (
        <p className="text-sm text-muted-foreground">
          Guest self-serve seat finder:{" "}
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            href={`/find-seat/${wedding.slug}`}
            target="_blank"
          >
            /find-seat/{wedding.slug}
          </Link>
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ScanLine className="h-5 w-5" />
            Look up guest
          </CardTitle>
          <CardDescription>
            Paste an invite URL/token from a scanned QR, or search by name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Paste invite link or token…"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="min-w-[220px] flex-1"
            />
            <Button onClick={searchByToken}>Scan / open</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search name, household, table…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchByName()}
              className="min-w-[220px] flex-1"
            />
            <Button variant="secondary" onClick={searchByName}>
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {results.map((guest) => (
          <Card key={guest.id}>
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{guest.fullName}</p>
                  <Badge variant="secondary">{guest.rsvpStatus}</Badge>
                  <Badge
                    variant={
                      guest.attendanceStatus === "ADMITTED"
                        ? "success"
                        : guest.attendanceStatus === "REJECTED"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {guest.attendanceStatus}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[guest.household, guest.tableLabel, guest.seatLabel]
                    .filter(Boolean)
                    .join(" · ") || "No seat assigned yet"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busyId === guest.id}
                  onClick={() => act(guest, "ADMITTED")}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Admit
                </Button>
                <Button
                  variant="outline"
                  disabled={busyId === guest.id}
                  onClick={() => act(guest, "REJECTED")}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                {guest.attendanceStatus !== "NOT_ARRIVED" && (
                  <Button
                    variant="ghost"
                    disabled={busyId === guest.id}
                    onClick={() => act(guest, "NOT_ARRIVED")}
                  >
                    Undo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!results.length && (
          <p className="text-sm text-muted-foreground">
            Search or paste a QR invite link to start checking guests in.
          </p>
        )}
      </div>
    </div>
  );
}
