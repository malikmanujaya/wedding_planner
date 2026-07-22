"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Sparkles } from "@/components/Sparkles";
import { Reveal } from "@/components/Reveal";
import { useI18n } from "@/i18n";
import { theme, hsl } from "@/theme";

export default function LandingPage() {
  const { brand, assets } = theme;
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const featureImages = [assets.planImage, assets.seatingImage, assets.publicImage];

  const navLinks = [
    { href: "#product", label: t.nav.product },
    { href: "#how", label: t.nav.how },
    { href: "#day-of", label: t.nav.dayOf },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <p className="font-display text-xl tracking-tight text-white drop-shadow-sm sm:text-2xl">
            {brand.name}
          </p>

          <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher tone="light" />
            <Button
              asChild
              variant="ghost"
              className="hidden text-white hover:bg-white/15 hover:text-white sm:inline-flex"
            >
              <Link href="/login">{t.nav.signIn}</Link>
            </Button>
            <Button asChild className="hidden bg-white text-moss hover:bg-white/90 md:inline-flex">
              <Link href="/register">{t.nav.getStarted}</Link>
            </Button>
            <button
              type="button"
              aria-label={t.nav.menu}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10 md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mx-4 animate-fade-in rounded-2xl border border-white/15 bg-ink/95 p-4 text-white shadow-2xl backdrop-blur-md md:hidden">
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-base transition-colors hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  {t.nav.signIn}
                </Link>
              </Button>
              <Button asChild className="bg-white text-moss hover:bg-white/90">
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  {t.nav.getStarted}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div
          className="absolute inset-0 origin-center bg-cover bg-center animate-ken-burns"
          style={{ backgroundImage: `url(${assets.heroImage})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(105deg, ${hsl(theme.colors.ink, 0.9)} 0%, ${hsl(theme.colors.ink, 0.58)} 42%, ${hsl(theme.colors.ink, 0.28)} 100%)`,
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.12] mix-blend-overlay" />
        <div
          className="absolute inset-0 animate-soft-pulse"
          style={{
            background:
              "radial-gradient(circle at 70% 35%, rgba(255,255,255,0.14), transparent 38%)",
          }}
          aria-hidden
        />
        <Sparkles count={26} colorClass="text-white/70" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <p className="animate-fade-up font-display text-[clamp(3rem,13vw,8.5rem)] leading-[0.9] tracking-[-0.03em] text-white">
            {brand.name}
          </p>
          <h1 className="mt-5 max-w-2xl animate-fade-up text-balance text-2xl font-medium tracking-tight text-white/95 [animation-delay:100ms] sm:mt-6 sm:text-3xl lg:text-4xl">
            {t.hero.headline}
          </h1>
          <p className="mt-4 max-w-xl animate-fade-up text-base leading-relaxed text-white/70 [animation-delay:200ms] sm:text-lg">
            {t.hero.support}
          </p>
          <div className="mt-8 flex animate-fade-up flex-col gap-3 [animation-delay:300ms] sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild size="lg" className="bg-white text-moss hover:bg-white/90">
              <Link href="/register">
                {t.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/login">{t.hero.ctaSecondary}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Capabilities — wrap on mobile, soft marquee on larger screens */}
      <section
        className="relative border-y border-border/70 bg-mist"
        aria-label="Capabilities"
      >
        {/* Mobile / tablet: wrapping flow with soft separators */}
        <ul className="mx-auto flex max-w-7xl list-none flex-wrap items-center justify-center gap-x-1 gap-y-2 px-4 py-7 sm:px-6 md:hidden">
          {t.capabilities.map((item, i) => (
            <li key={item} className="inline-flex items-center">
              {i > 0 && (
                <span
                  className="mx-2.5 h-1 w-1 shrink-0 rounded-full bg-primary/40"
                  aria-hidden
                />
              )}
              <span className="text-[0.9rem] font-medium tracking-wide text-foreground/85">
                {item}
              </span>
            </li>
          ))}
        </ul>

        {/* Desktop: faded infinite marquee */}
        <div className="relative hidden overflow-hidden py-5 md:block">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-mist to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-mist to-transparent"
            aria-hidden
          />
          <div className="flex w-max animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
            {[...t.capabilities, ...t.capabilities].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="inline-flex items-center gap-8 px-4 text-[0.95rem] tracking-[0.02em] text-foreground/75"
              >
                <span className="font-medium text-foreground">{item}</span>
                <span
                  className="h-1 w-1 shrink-0 rounded-full bg-primary/35"
                  aria-hidden
                />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Product stories */}
      <section id="product" className="relative scroll-mt-20">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${hsl(theme.colors.accent, 0.45)}, transparent 60%)`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {t.product.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-5xl">
              {t.product.title}
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              {t.product.support}
            </p>
          </Reveal>

          <div className="mt-14 space-y-20 sm:mt-20 lg:space-y-32">
            {t.product.features.map((feature, index) => {
              const image = featureImages[index] ?? featureImages[0];
              const reverse = index % 2 === 1;
              return (
                <article
                  key={feature.title}
                  className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14"
                >
                  <Reveal
                    from={reverse ? "right" : "left"}
                    className={`relative overflow-hidden lg:col-span-7 ${
                      reverse ? "lg:order-2" : ""
                    }`}
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(to top, ${hsl(theme.colors.ink, 0.18)}, transparent 40%)`,
                      }}
                    />
                  </Reveal>
                  <Reveal
                    from={reverse ? "left" : "right"}
                    delay={120}
                    className={`lg:col-span-5 ${reverse ? "lg:order-1" : ""}`}
                  >
                    <p className="font-display text-5xl leading-none text-primary/15 sm:text-6xl">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-display text-2xl tracking-tight sm:text-4xl">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                      {feature.body}
                    </p>
                  </Reveal>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-y border-border bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {t.how.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-5xl">
              {t.how.title}
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">{t.how.support}</p>
          </Reveal>

          <ol className="mt-12 grid gap-0 md:grid-cols-3 sm:mt-14">
            {t.how.steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={i * 120}
                className={`relative border-border py-8 md:border-l md:px-8 md:py-2 ${
                  i === 0 ? "md:border-l-0 md:pl-0" : ""
                } ${i > 0 ? "border-t md:border-t-0" : ""}`}
              >
                <span className="font-display text-4xl text-primary/25 sm:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-xl tracking-tight sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {t.roles.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-5xl">
              {t.roles.title}
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">{t.roles.support}</p>
        </Reveal>

        <div className="mt-12 grid gap-8 sm:mt-14 sm:grid-cols-3">
          {t.roles.items.map((role, i) => (
            <Reveal
              key={role.title}
              delay={i * 120}
              className="group border-t-2 border-primary/30 pt-6"
            >
              <h3 className="font-display text-xl tracking-tight transition-colors group-hover:text-primary sm:text-2xl">
                {role.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {role.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Day-of */}
      <section id="day-of" className="relative scroll-mt-20 overflow-hidden bg-ink text-white">
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.1] mix-blend-overlay" />
        <Sparkles count={16} colorClass="text-white/40" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-28 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal from="left">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
              {t.dayOf.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-5xl">
              {t.dayOf.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/65 sm:text-lg">
              {t.dayOf.support}
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/80 sm:text-base">
              {t.dayOf.bullets.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal from="right" delay={120} className="relative aspect-[5/4] overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assets.dayOfImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${hsl(theme.colors.ink, 0.35)}, transparent 55%)`,
              }}
            />
          </Reveal>
        </div>
      </section>

      {/* Public page */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal
            from="left"
            className="relative order-2 aspect-[4/5] overflow-hidden rounded-xl sm:aspect-[5/4] lg:order-1 lg:aspect-[4/5]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assets.publicImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </Reveal>
          <Reveal from="right" delay={120} className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {t.publicSection.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-5xl">
              {t.publicSection.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.publicSection.support}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-foreground sm:gap-x-8">
              {t.publicSection.tags.map((tag) => (
                <span key={tag} className="border-b border-primary/30 pb-0.5">
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 30% 40%, ${hsl(theme.colors.accent, 0.7)}, transparent 50%), linear-gradient(180deg, ${hsl(theme.colors.mist)}, ${hsl(theme.colors.background)})`,
          }}
          aria-hidden
        />
        <Reveal className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-16 sm:px-6 sm:py-28 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl tracking-tight sm:text-5xl lg:text-6xl">
              {t.cta.title}
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">{t.cta.support}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild size="lg">
              <Link href="/register">
                {t.cta.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">{t.cta.ctaSecondary}</Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-xl text-foreground">{brand.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.footer.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              {t.footer.signIn}
            </Link>
            <Link href="/register" className="hover:text-foreground">
              {t.footer.getStarted}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
