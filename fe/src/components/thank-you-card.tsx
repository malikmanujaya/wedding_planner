"use client";

import { mediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export const THANK_YOU_TEMPLATES = [
  { key: "classic", label: "Classic ivory" },
  { key: "botanical", label: "Botanical green" },
  { key: "elegant", label: "Elegant blush" },
  { key: "midnight", label: "Midnight" },
] as const;

type TemplateKey = (typeof THANK_YOU_TEMPLATES)[number]["key"];

const styles: Record<
  TemplateKey,
  { card: string; heading: string; body: string; rule: string }
> = {
  classic: {
    card: "bg-[hsl(40_45%_97%)] text-[hsl(30_15%_20%)] border border-[hsl(38_30%_82%)]",
    heading: "text-[hsl(30_25%_25%)]",
    body: "text-[hsl(30_12%_32%)]",
    rule: "bg-[hsl(38_30%_75%)]",
  },
  botanical: {
    card: "bg-[hsl(150_25%_96%)] text-[hsl(160_25%_18%)] border border-[hsl(150_20%_78%)]",
    heading: "text-[hsl(162_35%_22%)]",
    body: "text-[hsl(160_15%_30%)]",
    rule: "bg-[hsl(150_25%_65%)]",
  },
  elegant: {
    card: "bg-[hsl(350_45%_97%)] text-[hsl(345_20%_25%)] border border-[hsl(350_30%_85%)]",
    heading: "text-[hsl(345_35%_30%)]",
    body: "text-[hsl(345_12%_35%)]",
    rule: "bg-[hsl(350_30%_75%)]",
  },
  midnight: {
    card: "bg-[hsl(220_35%_14%)] text-[hsl(40_35%_92%)] border border-[hsl(220_25%_28%)]",
    heading: "text-[hsl(42_60%_80%)]",
    body: "text-[hsl(220_15%_80%)]",
    rule: "bg-[hsl(42_40%_60%)]",
  },
};

type Props = {
  templateKey: string;
  message: string;
  signature?: string | null;
  imageUrl?: string | null;
  coupleNames?: string | null;
  weddingDate?: string | null;
  className?: string;
};

export function ThankYouCardView({
  templateKey,
  message,
  signature,
  imageUrl,
  coupleNames,
  weddingDate,
  className,
}: Props) {
  const s = styles[(templateKey as TemplateKey) in styles ? (templateKey as TemplateKey) : "classic"];
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md overflow-hidden rounded-2xl shadow-lg",
        s.card,
        className
      )}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(imageUrl)} alt="" className="h-56 w-full object-cover" />
      )}
      <div className="px-8 py-10 text-center">
        <p className={cn("text-xs uppercase tracking-[0.3em]", s.body)}>With gratitude</p>
        <h2 className={cn("mt-3 font-display text-3xl tracking-tight", s.heading)}>
          Thank you
        </h2>
        <div className={cn("mx-auto mt-4 h-px w-16", s.rule)} />
        <p className={cn("mt-6 whitespace-pre-line text-[15px] leading-relaxed", s.body)}>
          {message}
        </p>
        {signature && (
          <p className={cn("mt-8 font-display text-xl", s.heading)}>{signature}</p>
        )}
        {(coupleNames || weddingDate) && (
          <p className={cn("mt-2 text-xs", s.body)}>
            {[coupleNames, weddingDate].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
