"use client";

import { Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { localeNames, locales } from "@/i18n/dictionaries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  /** "light" for dark backgrounds (white text), "dark" for light backgrounds. */
  tone?: "light" | "dark";
  className?: string;
};

export function LanguageSwitcher({ tone = "dark", className }: Props) {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t.nav.language}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          tone === "light"
            ? "border-white/30 text-white hover:bg-white/10"
            : "border-border text-foreground hover:bg-accent",
          className
        )}
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem]">
        {locales.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLocale(code)}
            className="flex items-center justify-between gap-3"
          >
            <span>{localeNames[code]}</span>
            {locale === code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
