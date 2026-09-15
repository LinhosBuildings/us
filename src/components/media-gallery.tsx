"use client";

import { useCallback, useEffect, useState } from "react";
import type { MediaAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Mobile-friendly media gallery. Images render as a tappable grid; tapping any
 * photo opens a full-screen lightbox (tap to close, arrows to browse, Esc to
 * leave). Videos/voice notes show placeholder tiles for now.
 */
export function MediaGallery({ items }: { items: MediaAsset[] }) {
  const images = items.filter((m) => m.type === "image");
  const others = items.filter((m) => m.type !== "image");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex === null, images.length]);

  const step = useCallback((dir: 1 | -1) => {
    setOpenIndex((i) => (i === null ? i : (i + dir + images.length) % images.length));
  }, [images.length]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setOpenIndex(i)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne",
                images.length > 1 && i === 0 ? "col-span-2" : ""
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt=""
                loading="lazy"
                className={cn(
                  "w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]",
                  images.length > 1 && i === 0 ? "aspect-[16/9]" : "aspect-[4/3]"
                )}
              />
            </button>
          ))}
        </div>
      ) : null}

      {others.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {others.map((m) => (
            <div
              key={m.id}
              className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-line bg-panel/50 text-mist"
            >
              <span className="text-[11px] uppercase tracking-widest">
                {m.type === "video" ? "▶ Video" : "♪ Voice note"}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {openIndex !== null && images[openIndex] ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-midnight/95 backdrop-blur-sm"
          onClick={() => setOpenIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
        >
          {/* prev / next (only when there are multiple) */}
          {images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-midnight/70 text-xl text-ivory backdrop-blur-md transition-colors hover:border-champagne/50 hover:text-champagne-soft sm:left-5"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-midnight/70 text-xl text-ivory backdrop-blur-md transition-colors hover:border-champagne/50 hover:text-champagne-soft sm:right-5"
              >
                ›
              </button>
              <span className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-midnight/70 px-3 py-1 font-mono text-[11px] text-mist">
                {openIndex + 1} / {images.length}
              </span>
            </>
          ) : null}

          {/* close */}
          <button
            type="button"
            aria-label="Close photo"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex(null);
            }}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-midnight/70 text-ivory backdrop-blur-md"
          >
            ✕
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[openIndex].url}
            alt=""
            className="max-h-[82dvh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          />
        </div>
      ) : null}
    </div>
  );
}