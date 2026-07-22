"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, Mail, Save } from "lucide-react";
import { api, getActiveWeddingId, mediaUrl, type Guest } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/ui/image-upload";
import { THANK_YOU_TEMPLATES, ThankYouCardView } from "@/components/thank-you-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DEFAULT_MESSAGE =
  "Dear {name},\n\nThank you so much for celebrating our special day with us. Your presence, love, and generosity mean the world to us.\n\nWith all our love";

export default function ThankYouPage() {
  const [weddingId, setWeddingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasCard, setHasCard] = useState(false);
  const [templateKey, setTemplateKey] = useState("classic");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [signature, setSignature] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [designedCardUrl, setDesignedCardUrl] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    const id = getActiveWeddingId();
    if (!id) {
      setLoading(false);
      return;
    }
    setWeddingId(id);
    Promise.all([api.getThankYouCard(id), api.listGuests(id)])
      .then(([card, guestList]) => {
        if (card) {
          setHasCard(true);
          setTemplateKey(card.templateKey);
          setMessage(card.message);
          setSignature(card.signature ?? "");
          setImageUrl(card.imageUrl ?? "");
          setDesignedCardUrl(card.designedCardUrl ?? "");
        }
        setGuests(guestList);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!weddingId || !message.trim()) {
      toast.error("Write a message first");
      return;
    }
    setSaving(true);
    try {
      await api.saveThankYouCard(weddingId, {
        templateKey,
        message: message.trim(),
        signature: signature.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        designedCardUrl: designedCardUrl.trim() || undefined,
      });
      setHasCard(true);
      toast.success("Thank-you card saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/thanks/${token}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Link copied"))
      .catch(() => toast.error("Could not copy"));
  }

  const guestsWithInvite = guests.filter((g) => g.inviteToken);

  if (loading) {
    return <p className="text-muted-foreground">Loading thank-you card…</p>;
  }

  if (!weddingId) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-display text-3xl tracking-tight">Thank-you card</h1>
        <p className="text-muted-foreground">Select an active wedding first.</p>
        <Button asChild>
          <Link href="/weddings">Go to weddings</Link>
        </Button>
      </div>
    );
  }

  const previewMessage = message.replace("{name}", guests[0]?.fullName ?? "Guest name");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Thank-you card</h1>
        <p className="mt-1 text-muted-foreground">
          Design one card for all guests. Each guest gets a personal link where{" "}
          <code className="rounded bg-muted px-1">{"{name}"}</code> becomes their name.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Design</CardTitle>
            <CardDescription>
              {hasCard ? "Your card is live — edits apply instantly." : "Not published yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Template</label>
              <div className="grid grid-cols-2 gap-2">
                {THANK_YOU_TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTemplateKey(t.key)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors",
                      templateKey === t.key
                        ? "border-primary bg-primary/10 font-medium"
                        : "hover:bg-muted"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Dear {name}, thank you for…"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Use {"{name}"} where the guest&apos;s name should appear.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Signature</label>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Nimali & Kasun"
              />
            </div>

            <ImageUploadField
              weddingId={weddingId}
              value={designedCardUrl}
              onChange={setDesignedCardUrl}
              label="Photographer's card design (optional)"
              hint="The finished card your photographer designed — shown to every guest above the personal message."
            />

            <ImageUploadField
              weddingId={weddingId}
              value={imageUrl}
              onChange={setImageUrl}
              label="Card photo (optional)"
              hint="Shown at the top of the personal message card."
            />

            <Button onClick={save} loading={saving} className="w-full">
              {!saving && <Save className="h-4 w-4" />}
              {saving ? "Saving…" : hasCard ? "Update card" : "Publish card"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-medium">Live preview — what each guest sees</p>
          {designedCardUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(designedCardUrl)}
              alt="Designed thank-you card"
              className="mx-auto w-full max-w-md rounded-2xl border shadow-lg"
            />
          )}
          <ThankYouCardView
            templateKey={templateKey}
            message={previewMessage}
            signature={signature}
            imageUrl={imageUrl}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5" />
            Guest links
          </CardTitle>
          <CardDescription>
            Copy a personal link per guest and send it via WhatsApp or email. Guests without an
            invite link can get one from the Guests page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasCard ? (
            <p className="text-sm text-muted-foreground">
              Publish the card first — the links will show a &quot;not published&quot; message
              until then.
            </p>
          ) : null}
          {guestsWithInvite.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No guests with invite links yet.{" "}
              <Link href="/guests" className="underline">
                Manage guests
              </Link>
            </p>
          ) : (
            <div className="divide-y">
              {guestsWithInvite.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{guest.fullName}</p>
                    {guest.household && (
                      <p className="truncate text-xs text-muted-foreground">{guest.household}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary">{guest.rsvpStatus}</Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => copyLink(guest.inviteToken!)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
