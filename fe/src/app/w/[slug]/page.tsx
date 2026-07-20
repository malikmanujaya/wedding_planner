"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, mediaUrl, type PublicWedding } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export default function PublicWeddingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const [page, setPage] = useState<PublicWedding | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [lookupMsg, setLookupMsg] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .getPublicWedding(slug)
      .then(setPage)
      .catch((err) => setError(err instanceof Error ? err.message : "Page not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  const countdown = useMemo(() => daysUntil(page?.weddingDate ?? null), [page?.weddingDate]);
  const displayName = page?.coupleNames?.trim() || page?.title || "";

  async function onRsvpLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setLooking(true);
    setLookupMsg(null);
    try {
      const res = await api.lookupPublicRsvp(slug, {
        fullName,
        email: email.trim() || undefined,
      });
      if (res.matched && res.inviteToken) {
        router.push(`/invite/guest/${res.inviteToken}`);
        return;
      }
      setLookupMsg(res.message);
    } catch (err) {
      setLookupMsg(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLooking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(158_22%_12%)] text-[hsl(150_20%_88%)]">
        Opening wedding page…
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[hsl(158_22%_12%)] px-4 text-center text-[hsl(150_20%_88%)]">
        <p className="text-sm tracking-[0.25em] text-[hsl(162_35%_55%)]">AISLE</p>
        <h1 className="font-display text-3xl">Page not found</h1>
        <p className="max-w-sm text-[hsl(150_12%_70%)]">{error ?? "This wedding page is unavailable."}</p>
      </div>
    );
  }

  const heroStyle = page.heroImageUrl
    ? {
        backgroundImage: `linear-gradient(120deg, hsl(158 28% 10% / 0.72), hsl(162 20% 14% / 0.55)), url(${mediaUrl(page.heroImageUrl)})`,
      }
    : {
        backgroundImage:
          "radial-gradient(ellipse 90% 70% at 70% 20%, hsl(162 35% 28%), transparent 55%), linear-gradient(160deg, hsl(158 28% 10%), hsl(150 18% 16%) 55%, hsl(162 22% 12%))",
      };

  return (
    <div className="min-h-screen bg-[hsl(150_18%_97%)] text-foreground">
      <section
        className="relative flex min-h-[100svh] flex-col justify-end bg-cover bg-center px-6 pb-16 pt-10 text-[hsl(150_30%_96%)] sm:px-10"
        style={heroStyle}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,hsl(158_28%_8%_/_0.55),transparent_45%)]" />
        <div className="relative z-10 mx-auto w-full max-w-3xl motion-safe:animate-[fadeUp_0.9s_ease-out]">
          <p className="text-xs font-medium tracking-[0.35em] text-[hsl(162_40%_72%)]">AISLE</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            {displayName}
          </h1>
          <p className="mt-4 max-w-xl text-base text-[hsl(150_20%_88%)] sm:text-lg">
            {page.weddingDate
              ? `Join us on ${page.weddingDate}${page.venue ? ` · ${page.venue}` : ""}`
              : page.venue
                ? `Celebrating at ${page.venue}`
                : "You’re invited to celebrate with us."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-[hsl(150_30%_96%)] text-[hsl(158_28%_14%)] hover:bg-white"
            >
              <a href="#rsvp">RSVP</a>
            </Button>
            {page.story && (
              <Button
                asChild
                variant="outline"
                className="border-[hsl(150_20%_80%/0.45)] bg-transparent text-[hsl(150_30%_96%)] hover:bg-[hsl(150_20%_100%/0.08)]"
              >
                <a href="#story">Our story</a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {countdown != null && (
        <section className="border-b border-[hsl(150_12%_86%)] bg-[hsl(158_18%_14%)] px-6 py-14 text-center text-[hsl(150_30%_96%)] sm:px-10">
          <p className="text-xs tracking-[0.3em] text-[hsl(162_35%_60%)]">COUNTDOWN</p>
          <p className="mt-3 font-display text-5xl tabular-nums sm:text-6xl">
            {countdown > 0 ? countdown : countdown === 0 ? "Today" : Math.abs(countdown)}
          </p>
          <p className="mt-2 text-sm text-[hsl(150_14%_72%)]">
            {countdown > 0
              ? `day${countdown === 1 ? "" : "s"} to go`
              : countdown === 0
                ? "The celebration is today"
                : `day${Math.abs(countdown) === 1 ? "" : "s"} since the wedding`}
          </p>
        </section>
      )}

      {page.story && (
        <section id="story" className="mx-auto max-w-2xl px-6 py-20 sm:px-10">
          <p className="text-xs font-medium tracking-[0.28em] text-[hsl(162_30%_35%)]">OUR STORY</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">How we got here</h2>
          <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">
            {page.story}
          </p>
        </section>
      )}

      {page.photoUrls.length > 0 && (
        <section className="border-y border-[hsl(150_12%_86%)] bg-[hsl(150_14%_94%)] px-4 py-16 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-xs font-medium tracking-[0.28em] text-[hsl(162_30%_35%)]">
              MOMENTS
            </p>
            <div className="mt-8 flex gap-3 overflow-x-auto pb-2 snap-x">
              {page.photoUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={mediaUrl(url)}
                  alt=""
                  className="h-56 w-72 shrink-0 snap-center object-cover sm:h-64 sm:w-80"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="rsvp" className="mx-auto max-w-lg px-6 py-20 sm:px-10">
        <p className="text-xs font-medium tracking-[0.28em] text-[hsl(162_30%_35%)]">RSVP</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight">Find your invitation</h2>
        <p className="mt-2 text-muted-foreground">
          Enter your name as it appears on the guest list. We’ll open your personal RSVP link.
        </p>
        <form onSubmit={onRsvpLookup} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="As on the invitation"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email <span className="text-muted-foreground">(if names match more than one)</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Optional"
            />
          </div>
          {lookupMsg && <p className="text-sm text-destructive">{lookupMsg}</p>}
          <Button type="submit" className="w-full" disabled={looking}>
            {looking ? "Looking…" : "Continue to RSVP"}
          </Button>
        </form>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Already have a link?{" "}
          <Link href={`/find-seat/${slug}`} className="underline">
            Find your seat
          </Link>
        </p>
      </section>

      <footer className="border-t border-[hsl(150_12%_86%)] px-6 py-8 text-center text-xs text-muted-foreground">
        Powered by Aisle
      </footer>
    </div>
  );
}
