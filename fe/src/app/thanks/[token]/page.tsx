"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, mediaUrl, type PublicThankYou } from "@/lib/api";
import { ThankYouCardView } from "@/components/thank-you-card";

export default function PublicThankYouPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [card, setCard] = useState<PublicThankYou | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .getPublicThankYou(token)
      .then(setCard)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Card not found")
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(40_30%_96%)] text-muted-foreground">
        Opening your card…
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(40_30%_96%)] px-4 text-center">
        <div>
          <p className="font-display text-2xl text-[hsl(30_20%_25%)]">Nothing here yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? "This link may be invalid or the card has not been published."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_hsl(162_35%_92%),_hsl(40_30%_96%)_55%)] px-4 py-12">
      <div className="w-full space-y-6">
        {card.designedCardUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl(card.designedCardUrl)}
            alt="Thank-you card"
            className="mx-auto w-full max-w-md rounded-2xl shadow-lg"
          />
        )}
        <ThankYouCardView
          templateKey={card.templateKey}
          message={card.message}
          signature={card.signature}
          imageUrl={card.imageUrl}
          coupleNames={card.coupleNames}
          weddingDate={card.weddingDate}
        />
        <p className="text-center text-xs text-muted-foreground">Powered by Aisle</p>
      </div>
    </div>
  );
}
