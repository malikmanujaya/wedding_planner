"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Camera } from "lucide-react";
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
  const [shareCaption, setShareCaption] = useState("");
  const [shareProgress, setShareProgress] = useState<number | null>(null);
  const [sharedCount, setSharedCount] = useState(0);
  const [shareError, setShareError] = useState<string | null>(null);
  const shareFileRef = useRef<HTMLInputElement>(null);

  async function onShareFiles(files: FileList | null) {
    if (!token || !files?.length) return;
    setShareError(null);
    setShareProgress(0);
    let uploaded = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) continue;
        if (isImage && file.size > 10 * 1024 * 1024) {
          setShareError(`${file.name}: images must be under 10 MB`);
          continue;
        }
        if (isVideo && file.size > 100 * 1024 * 1024) {
          setShareError(`${file.name}: videos must be under 100 MB`);
          continue;
        }
        await api.guestUploadToGallery(token, file, shareCaption.trim() || undefined, (p) => {
          const base = (i / files.length) * 100;
          setShareProgress(Math.round(base + p / files.length));
        });
        uploaded += 1;
      }
      if (uploaded > 0) {
        setSharedCount((c) => c + uploaded);
        setShareCaption("");
      }
    } catch (err) {
      setShareError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setShareProgress(null);
      if (shareFileRef.current) shareFileRef.current.value = "";
    }
  }

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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-2xl">
              <Camera className="h-5 w-5" />
              Share your photos
            </CardTitle>
            <CardDescription>
              Took a great photo or video? Send it to the couple — it will appear in their
              gallery once they approve it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={shareCaption}
              onChange={(e) => setShareCaption(e.target.value)}
              placeholder="Caption (optional)"
              disabled={shareProgress != null}
            />
            <input
              ref={shareFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              multiple
              className="hidden"
              onChange={(e) => onShareFiles(e.target.files)}
            />
            {shareProgress != null ? (
              <div className="rounded-md border bg-muted/40 px-4 py-3">
                <p className="mb-2 text-sm font-medium">Uploading… {shareProgress}%</p>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${shareProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => shareFileRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                Choose photos or videos
              </Button>
            )}
            {shareError && <p className="text-sm text-destructive">{shareError}</p>}
            {sharedCount > 0 && (
              <p className="text-sm text-[hsl(162_35%_30%)]">
                {sharedCount} file{sharedCount === 1 ? "" : "s"} sent to the couple — thank you!
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Photos up to 10 MB, videos up to 100 MB (MP4/WebM).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
