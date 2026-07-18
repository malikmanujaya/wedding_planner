import Link from "next/link";
import { Button } from "@/components/ui/button";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=80";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <p className="font-display text-2xl tracking-tight text-white drop-shadow-sm">
            Aisle
          </p>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-white hover:bg-white/15 hover:text-white">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-white text-[hsl(162_42%_22%)] hover:bg-white/90">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative min-h-[100svh] overflow-hidden">
        {/* Full-bleed hero plane */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(160_22%_8%/0.88)] via-[hsl(160_22%_10%/0.45)] to-[hsl(160_22%_12%/0.25)]" />
        <div className="absolute inset-0 animate-soft-pulse bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12),transparent_45%)]" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
          <p className="animate-fade-up font-display text-5xl text-white sm:text-7xl md:text-8xl">
            Aisle
          </p>
          <h1 className="mt-4 max-w-2xl animate-fade-up text-balance text-2xl font-medium tracking-tight text-white/95 [animation-delay:120ms] sm:text-3xl">
            The calm center for every wedding detail.
          </h1>
          <p className="mt-3 max-w-xl animate-fade-up text-base text-white/75 [animation-delay:220ms] sm:text-lg">
            Guests, seating, vendors, RSVPs, and day-of tools — built for couples
            and crews who want clarity, not chaos.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:320ms]">
            <Button asChild size="lg" className="bg-white text-[hsl(162_42%_22%)] hover:bg-white/90">
              <Link href="/register">Start planning free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
          One workspace. Every role.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Couples steer the plan. Crew handles day-of. Guests find their seat.
          Vendors stay on schedule.
        </p>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            {
              title: "Plan with your crew",
              body: "Checklists, responsibilities, and wedding vendors in one shared space.",
            },
            {
              title: "Seat with confidence",
              body: "Canvas seating charts, invite QR codes, and entrance check-in.",
            },
            {
              title: "Share the day",
              body: "Public countdown pages, galleries, gifts, and WhatsApp RSVPs.",
            },
          ].map((item) => (
            <div key={item.title} className="border-t border-border pt-6">
              <h3 className="font-display text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-display text-3xl tracking-tight">
              Ready when you are.
            </h2>
            <p className="mt-2 text-muted-foreground">
              Create your account and set up your first wedding in minutes.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <span className="font-display text-base text-foreground">Aisle</span>
        <span>Wedding planning, without the noise.</span>
      </footer>
    </div>
  );
}
