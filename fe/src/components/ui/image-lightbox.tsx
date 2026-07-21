"use client";

import { useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";

type LightboxItem = {
  imageUrl: string;
  caption?: string | null;
  mediaType?: "PHOTO" | "VIDEO";
};

type Props = {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function ImageLightbox({ items, index, onClose, onIndexChange }: Props) {
  const open = index != null && items[index];

  const go = useCallback(
    (delta: number) => {
      if (index == null || !items.length) return;
      const next = (index + delta + items.length) % items.length;
      onIndexChange(next);
    },
    [index, items.length, onIndexChange]
  );

  useEffect(() => {
    if (index == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onClose, go]);

  if (!open || index == null) return null;

  const item = items[index];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(158_28%_6%/0.92)] p-4"
      role="dialog"
      aria-modal
      onClick={onClose}
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="absolute right-4 top-4 text-white hover:bg-white/10 hover:text-white"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>

      {items.length > 1 && (
        <>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white sm:left-6"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white sm:right-6"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      <div
        className="flex max-h-[90vh] max-w-5xl flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {item.mediaType === "VIDEO" ? (
          <video
            src={mediaUrl(item.imageUrl)}
            controls
            autoPlay
            className="max-h-[80vh] w-auto max-w-full object-contain"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={mediaUrl(item.imageUrl)}
            alt={item.caption ?? ""}
            className="max-h-[80vh] w-auto max-w-full object-contain"
          />
        )}
        <div className="flex items-center gap-3 text-sm text-[hsl(150_20%_85%)]">
          {item.caption && <span>{item.caption}</span>}
          <span className="tabular-nums opacity-70">
            {index + 1} / {items.length}
          </span>
        </div>
      </div>
    </div>
  );
}
