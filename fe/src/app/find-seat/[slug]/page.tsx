"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type FinderResult = {
  matched: boolean;
  message: string;
  guestName: string | null;
  tableLabel: string | null;
  seatLabel: string | null;
  rsvpStatus: string | null;
  attendanceStatus: string | null;
};

export default function FindSeatPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [guestName, setGuestName] = useState("");
  const [tableLabel, setTableLabel] = useState("");
  const [result, setResult] = useState<FinderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.findSeat(slug, { guestName, tableLabel });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find seat");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_hsl(162_35%_92%),_hsl(40_30%_96%)_55%)] px-4 py-12">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <p className="text-sm font-medium tracking-[0.2em] text-[hsl(162_30%_35%)]">AISLE</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Find your seat</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your name and the table on your invitation card.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seat finder</CardTitle>
            <CardDescription>Used at the entrance when QR is not available.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Your name</label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="As on the guest list"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Table on your card</label>
                <Input
                  value={tableLabel}
                  onChange={(e) => setTableLabel(e.target.value)}
                  placeholder="Table 4"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Checking…" : "Find seat"}
              </Button>
            </form>

            {result && (
              <div
                className={`mt-5 rounded-md border px-4 py-3 ${
                  result.matched
                    ? "border-[hsl(162_30%_75%)] bg-[hsl(162_35%_96%)]"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <p className="text-sm font-medium">{result.message}</p>
                {result.matched && (
                  <div className="mt-2 space-y-1">
                    <p className="text-lg font-medium">{result.guestName}</p>
                    <p>
                      {result.tableLabel}
                      {result.seatLabel ? ` · ${result.seatLabel}` : ""}
                    </p>
                    {result.rsvpStatus && (
                      <Badge variant="secondary">{result.rsvpStatus}</Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
