"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { theme, hsl } from "@/theme";
import { Sparkles } from "@/components/Sparkles";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n";

export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const { brand } = theme;
  const { t } = useI18n();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center animate-ken-burns"
          style={{ backgroundImage: `url(${theme.assets.authImage})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${hsl(theme.colors.ink, 0.74)} 0%, ${hsl(theme.colors.moss, 0.55)} 55%, ${hsl(theme.colors.ink, 0.8)} 100%)`,
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 animate-soft-pulse"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.16), transparent 40%)",
          }}
          aria-hidden
        />
        <Sparkles count={18} colorClass="text-white/60" />
        <div className="relative z-10 flex h-full min-h-screen flex-col justify-between p-10 text-white">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 font-display text-3xl tracking-tight transition-opacity hover:opacity-90"
          >
            {brand.name}
          </Link>
          <div className="max-w-md animate-fade-up">
            <p className="font-display text-4xl leading-tight tracking-tight xl:text-5xl">
              {brand.name}
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/78">{t.auth.panel}</p>
          </div>
          <p className="text-sm text-white/55">{t.footer.tagline}</p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-screen flex-col px-4 py-6 sm:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top left, ${hsl(theme.colors.accent, 0.65)}, transparent 42%), radial-gradient(ellipse at bottom right, ${hsl(theme.colors.mist)}, transparent 40%), ${hsl(theme.colors.background)}`,
          }}
          aria-hidden
        />

        {/* Top bar: back to home + language */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.auth.backToHome}
          </Link>
          <LanguageSwitcher tone="dark" className="bg-card/70 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md animate-fade-up">
            <Link
              href="/"
              className="font-display text-3xl tracking-tight text-foreground lg:hidden"
            >
              {brand.name}
            </Link>

            <div
              className="mt-6 rounded-2xl border border-border/70 bg-card/90 p-6 backdrop-blur-sm sm:p-8 lg:mt-0"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <h1 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
              <div className="mt-7">{children}</div>
              <p className="mt-7 text-sm text-muted-foreground">{footer}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
