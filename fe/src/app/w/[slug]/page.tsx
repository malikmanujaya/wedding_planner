"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Play } from "lucide-react";
import {
  api,
  mediaUrl,
  type CashFund,
  type GalleryAlbum,
  type GiftItem,
  type PublicWedding,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [funds, setFunds] = useState<CashFund[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [lookupMsg, setLookupMsg] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [claimGift, setClaimGift] = useState<GiftItem | null>(null);
  const [claimName, setClaimName] = useState("");
  const [claimEmail, setClaimEmail] = useState("");
  const [claimMessage, setClaimMessage] = useState("");
  const [claiming, setClaiming] = useState(false);

  const [contributeFund, setContributeFund] = useState<CashFund | null>(null);
  const [contribName, setContribName] = useState("");
  const [contribEmail, setContribEmail] = useState("");
  const [contribAmount, setContribAmount] = useState("");
  const [contribMessage, setContribMessage] = useState("");
  const [contributing, setContributing] = useState(false);
  const [contribDone, setContribDone] = useState(false);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      api.getPublicWedding(slug),
      api.getPublicGallery(slug),
      api.getPublicRegistry(slug),
    ])
      .then(([wedding, gallery, registry]) => {
        setPage(wedding);
        setAlbums(gallery.filter((a) => a.photos.length > 0));
        setGifts(registry.gifts);
        setFunds(registry.cashFunds);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Page not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  const countdown = useMemo(() => daysUntil(page?.weddingDate ?? null), [page?.weddingDate]);
  const displayName = page?.coupleNames?.trim() || page?.title || "";
  const lightboxItems = useMemo(
    () =>
      albums.flatMap((a) =>
        a.photos.map((p) => ({
          imageUrl: p.imageUrl,
          caption: p.caption || a.title,
          mediaType: p.mediaType,
        }))
      ),
    [albums]
  );

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

  async function onClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !claimGift) return;
    setClaiming(true);
    try {
      const updated = await api.claimGift(slug, claimGift.id, {
        claimerName: claimName,
        claimerEmail: claimEmail.trim() || undefined,
        message: claimMessage.trim() || undefined,
      });
      setGifts((prev) => prev.map((g) => (g.id === updated.id ? { ...g, ...updated, claims: [] } : g)));
      setClaimGift(null);
      setClaimName("");
      setClaimEmail("");
      setClaimMessage("");
    } catch (err) {
      setLookupMsg(err instanceof Error ? err.message : "Could not claim gift");
    } finally {
      setClaiming(false);
    }
  }

  async function onContribute(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !contributeFund) return;
    setContributing(true);
    try {
      await api.contributeCash(slug, contributeFund.id, {
        contributorName: contribName,
        contributorEmail: contribEmail.trim() || undefined,
        amount: Number(contribAmount),
        message: contribMessage.trim() || undefined,
      });
      const registry = await api.getPublicRegistry(slug);
      setFunds(registry.cashFunds);
      setContribDone(true);
    } catch (err) {
      setLookupMsg(err instanceof Error ? err.message : "Could not contribute");
    } finally {
      setContributing(false);
    }
  }

  const hasRegistry = gifts.length > 0 || funds.length > 0;

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

  let flatPhotoIndex = 0;

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
            {albums.length > 0 && (
              <Button
                asChild
                variant="outline"
                className="border-[hsl(150_20%_80%/0.45)] bg-transparent text-[hsl(150_30%_96%)] hover:bg-[hsl(150_20%_100%/0.08)]"
              >
                <a href="#gallery">Gallery</a>
              </Button>
            )}
            {hasRegistry && (
              <Button
                asChild
                variant="outline"
                className="border-[hsl(150_20%_80%/0.45)] bg-transparent text-[hsl(150_30%_96%)] hover:bg-[hsl(150_20%_100%/0.08)]"
              >
                <a href="#registry">Gifts</a>
              </Button>
            )}
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

      {albums.length > 0 && (
        <section id="gallery" className="mx-auto max-w-5xl px-4 py-20 sm:px-8">
          <p className="text-center text-xs font-medium tracking-[0.28em] text-[hsl(162_30%_35%)]">
            GALLERY
          </p>
          <h2 className="mt-3 text-center font-display text-3xl tracking-tight sm:text-4xl">
            Photos
          </h2>
          <div className="mt-12 space-y-14">
            {albums.map((album) => (
              <div key={album.id}>
                <h3 className="font-display text-2xl tracking-tight">{album.title}</h3>
                {album.description && (
                  <p className="mt-1 text-muted-foreground">{album.description}</p>
                )}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {album.photos.map((photo) => {
                    const idx = flatPhotoIndex++;
                    return (
                      <button
                        key={photo.id}
                        type="button"
                        className="overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        onClick={() => setLightboxIndex(idx)}
                      >
                        {photo.mediaType === "VIDEO" ? (
                          <span className="relative block">
                            <video
                              src={mediaUrl(photo.imageUrl)}
                              muted
                              preload="metadata"
                              className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                            />
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white">
                                <Play className="h-4 w-4" />
                              </span>
                            </span>
                          </span>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={mediaUrl(photo.imageUrl)}
                            alt={photo.caption ?? album.title}
                            className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasRegistry && (
        <section id="registry" className="border-y border-[hsl(150_12%_86%)] bg-[hsl(150_14%_94%)] px-4 py-20 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-xs font-medium tracking-[0.28em] text-[hsl(162_30%_35%)]">
              REGISTRY
            </p>
            <h2 className="mt-3 text-center font-display text-3xl tracking-tight sm:text-4xl">
              Gifts & funds
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
              Claim a gift or contribute to a cash fund. Online payment arrives with PayHere next.
            </p>

            {funds.length > 0 && (
              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                {funds.map((fund) => (
                  <div key={fund.id} className="rounded-xl border bg-background p-5">
                    {fund.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaUrl(fund.imageUrl)}
                        alt=""
                        className="mb-4 h-40 w-full rounded-lg object-cover"
                      />
                    )}
                    <h3 className="font-display text-2xl">{fund.title}</h3>
                    {fund.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{fund.description}</p>
                    )}
                    <p className="mt-3 text-sm font-medium">
                      {fund.currency} {Number(fund.raisedAmount).toLocaleString()} of{" "}
                      {Number(fund.goalAmount).toLocaleString()}
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, fund.progressPercent)}%` }}
                      />
                    </div>
                    <Button
                      className="mt-4 w-full"
                      onClick={() => {
                        setContributeFund(fund);
                        setContribDone(false);
                        setContribName("");
                        setContribEmail("");
                        setContribAmount("");
                        setContribMessage("");
                      }}
                    >
                      Contribute
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {gifts.length > 0 && (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gifts.map((gift) => (
                  <div key={gift.id} className="overflow-hidden rounded-xl border bg-background">
                    {gift.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaUrl(gift.imageUrl)}
                        alt=""
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center bg-muted text-muted-foreground">
                        Gift
                      </div>
                    )}
                    <div className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{gift.title}</h3>
                        {gift.fullyClaimed ? (
                          <Badge variant="outline">Claimed</Badge>
                        ) : (
                          <Badge variant="secondary">
                            {gift.remaining} left
                          </Badge>
                        )}
                      </div>
                      {gift.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {gift.description}
                        </p>
                      )}
                      {gift.priceAmount != null && (
                        <p className="text-sm">
                          {gift.currency} {Number(gift.priceAmount).toLocaleString()}
                        </p>
                      )}
                      <div className="flex gap-2 pt-1">
                        {gift.storeUrl && (
                          <Button asChild size="sm" variant="outline">
                            <a href={gift.storeUrl} target="_blank" rel="noreferrer">
                              View
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          disabled={gift.fullyClaimed}
                          onClick={() => {
                            setClaimGift(gift);
                            setClaimName("");
                            setClaimEmail("");
                            setClaimMessage("");
                          }}
                        >
                          {gift.fullyClaimed ? "Fully claimed" : "Claim"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      <ImageLightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />

      <Dialog open={claimGift != null} onOpenChange={(open) => !open && setClaimGift(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim {claimGift?.title}</DialogTitle>
            <DialogDescription>
              We’ll mark this gift as claimed so others know it’s taken.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onClaim} className="space-y-3">
            <Input
              value={claimName}
              onChange={(e) => setClaimName(e.target.value)}
              placeholder="Your name"
              required
            />
            <Input
              type="email"
              value={claimEmail}
              onChange={(e) => setClaimEmail(e.target.value)}
              placeholder="Email (optional)"
            />
            <Input
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              placeholder="Note for the couple (optional)"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setClaimGift(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={claiming}>
                {claiming ? "Claiming…" : "Claim gift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={contributeFund != null}
        onOpenChange={(open) => {
          if (!open) {
            setContributeFund(null);
            setContribDone(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {contribDone ? "Thank you" : `Contribute to ${contributeFund?.title}`}
            </DialogTitle>
            <DialogDescription>
              {contribDone
                ? "Your pledge is recorded. The couple will confirm it (PayHere payments come next)."
                : "Enter an amount to pledge. Online payment will be added with PayHere."}
            </DialogDescription>
          </DialogHeader>
          {contribDone ? (
            <DialogFooter>
              <Button type="button" onClick={() => setContributeFund(null)}>
                Done
              </Button>
            </DialogFooter>
          ) : (
            <form onSubmit={onContribute} className="space-y-3">
              <Input
                value={contribName}
                onChange={(e) => setContribName(e.target.value)}
                placeholder="Your name"
                required
              />
              <Input
                type="email"
                value={contribEmail}
                onChange={(e) => setContribEmail(e.target.value)}
                placeholder="Email (optional)"
              />
              <Input
                type="number"
                min={1}
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                placeholder={`Amount (${contributeFund?.currency ?? "LKR"})`}
                required
              />
              <Input
                value={contribMessage}
                onChange={(e) => setContribMessage(e.target.value)}
                placeholder="Message (optional)"
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setContributeFund(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={contributing}>
                  {contributing ? "Saving…" : "Submit pledge"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
