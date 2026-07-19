"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Globe, Save } from "lucide-react";
import {
  api,
  getActiveWeddingId,
  type WeddingPublicPage,
} from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PublicPageEditor() {
  const [weddingId, setWeddingId] = useState<number | null>(null);
  const [page, setPage] = useState<WeddingPublicPage | null>(null);
  const [coupleNames, setCoupleNames] = useState("");
  const [story, setStory] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [photoUrlsText, setPhotoUrlsText] = useState("");
  const [publicEnabled, setPublicEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: number) => {
    const data = await api.getWeddingPublicPage(id);
    setPage(data);
    setCoupleNames(data.coupleNames ?? "");
    setStory(data.story ?? "");
    setHeroImageUrl(data.heroImageUrl ?? "");
    setPhotoUrlsText(data.photoUrls.join("\n"));
    setPublicEnabled(data.publicEnabled);
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

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId) return;
    setSaving(true);
    setError(null);
    try {
      const photoUrls = photoUrlsText
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
      const data = await api.updateWeddingPublicPage(weddingId, {
        coupleNames,
        story,
        heroImageUrl,
        photoUrls,
        publicEnabled,
      });
      setPage(data);
      toast.success("Public page saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading public page…</p>;
  }

  if (!weddingId) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-display text-3xl tracking-tight">Public page</h1>
        <p className="text-muted-foreground">Select an active wedding first.</p>
        <Button asChild>
          <Link href="/weddings">Go to weddings</Link>
        </Button>
      </div>
    );
  }

  const publicUrl = page ? `/w/${page.slug}` : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Public page</h1>
          <p className="mt-1 text-muted-foreground">
            Microsite for guests — countdown, story, photos, and RSVP entry.
          </p>
        </div>
        {publicUrl && (
          <Button asChild variant="outline">
            <Link href={publicUrl} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Open /w/{page?.slug}
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-5 w-5" />
            {page?.title ?? "Wedding"}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            Slug <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/{page?.slug}</code>
            <Badge variant={publicEnabled ? "secondary" : "outline"}>
              {publicEnabled ? "Published" : "Hidden"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-5">
            <div className="flex items-center gap-3">
              <input
                id="publicEnabled"
                type="checkbox"
                className="h-4 w-4 accent-[hsl(162_42%_28%)]"
                checked={publicEnabled}
                onChange={(e) => setPublicEnabled(e.target.checked)}
              />
              <label htmlFor="publicEnabled" className="text-sm font-medium">
                Publish public page at /w/{page?.slug}
              </label>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Couple names</label>
              <Input
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                placeholder="Nimali & Kasun"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Shown as the hero title. Falls back to the wedding title if empty.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Hero image URL</label>
              <Input
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Our story</label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={6}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="A short note for guests…"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Photo strip URLs</label>
              <textarea
                value={photoUrlsText}
                onChange={(e) => setPhotoUrlsText(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={"One URL per line\nhttps://…\nhttps://…"}
              />
              <p className="mt-1 text-xs text-muted-foreground">Up to 12 image URLs.</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save public page"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
