"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type PublicInvite } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GuestInvitePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [invite, setInvite] = useState<PublicInvite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<PublicInvite["rsvpStatus"]>("PENDING");
  const [meal, setMeal] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .getPublicInvite(token)
      .then((data) => {
        setInvite(data);
        setRsvpStatus(data.rsvpStatus);
        setMeal(data.mealPreference ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Invite not found"))
      .finally(() => setLoading(false));
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const data = await api.submitPublicRsvp(token, {
        rsvpStatus,
        mealPreference: meal || undefined,
        notes: notes || undefined,
      });
      setInvite(data);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save RSVP");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(40_30%_96%)] text-muted-foreground">
        Opening invitation…
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(40_30%_96%)] px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invitation not found</CardTitle>
            <CardDescription>{error ?? "This link may be invalid or expired."}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_hsl(162_35%_92%),_hsl(40_30%_96%)_55%)] px-4 py-12">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center">
          <p className="text-sm font-medium tracking-[0.2em] text-[hsl(162_30%_35%)]">AISLE</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-[hsl(162_35%_18%)]">
            {invite.weddingTitle}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {[invite.weddingDate, invite.venue].filter(Boolean).join(" · ") || "You’re invited"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Hello, {invite.guestName}</CardTitle>
            <CardDescription>
              Please confirm your RSVP
              {invite.household ? ` · ${invite.household}` : ""}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {invite.seatAssigned && (
              <div className="rounded-md border border-[hsl(162_30%_80%)] bg-[hsl(162_35%_96%)] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[hsl(162_25%_40%)]">Your seat</p>
                <p className="mt-1 text-lg font-medium text-[hsl(162_35%_18%)]">
                  {invite.tableLabel}
                  {invite.seatLabel ? ` · ${invite.seatLabel}` : ""}
                </p>
              </div>
            )}

            {invite.attendanceStatus && invite.attendanceStatus !== "NOT_ARRIVED" && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Entrance</span>
                <Badge variant={invite.attendanceStatus === "ADMITTED" ? "success" : "destructive"}>
                  {invite.attendanceStatus}
                </Badge>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Current RSVP</span>
              <Badge variant="secondary">{invite.rsvpStatus}</Badge>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Will you attend?</label>
                <Select
                  value={rsvpStatus}
                  onChange={(e) =>
                    setRsvpStatus(e.target.value as PublicInvite["rsvpStatus"])
                  }
                >
                  <option value="ACCEPTED">Joyfully accept</option>
                  <option value="DECLINED">Regretfully decline</option>
                  <option value="MAYBE">Maybe</option>
                  <option value="PENDING">Still deciding</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Meal preference</label>
                <Input
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                  placeholder="Vegetarian, chicken, kids meal…"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Note for hosts</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Allergies, plus-one, arrival time…"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {saved && (
                <p className="text-sm text-[hsl(162_35%_30%)]">RSVP saved — thank you!</p>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving…" : "Send RSVP"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
