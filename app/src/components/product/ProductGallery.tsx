"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Главное фото + миниатюры. Свайп на телефоне — горизонтальный scroll-snap,
// клик по фото — увеличение на весь экран (стрелки и Esc работают).
// Показывается только когда фото больше одного или есть хотя бы одно; пустую
// галерею (заглушка категории) рисует вызывающий компонент.
function scrollTrack(track: HTMLDivElement | null, i: number) {
  track?.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
}

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = (i: number) => {
    scrollTrack(trackRef.current, i);
    setIndex(i);
  };

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
      // keep the swipe track under the overlay on the same photo
      const to = e.key === "ArrowLeft" ? index - 1 : e.key === "ArrowRight" ? index + 1 : index;
      if (to !== index && to >= 0 && to < images.length) {
        scrollTrack(trackRef.current, to);
        setIndex(to);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoomed, index, images.length]);

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== index) setIndex(i);
        }}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-md bg-surface-sunken"
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setZoomed(true)}
            aria-label="Увеличить фото"
            className="relative aspect-square w-full shrink-0 cursor-zoom-in snap-center"
          >
            {/* Photos come from admin uploads / Poster — plain <img>, see ProductCard.tsx for why. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${alt} — фото ${i + 1}`} className="absolute inset-0 size-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Фото ${i + 1}`}
              aria-current={i === index}
              className={`size-16 shrink-0 overflow-hidden rounded-sm border-2 transition-colors duration-150 ease-standard ${
                i === index ? "border-gold-strong" : "border-transparent hover:border-border-strong"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Фото товара"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setZoomed(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[index]} alt={alt} className="max-h-full max-w-full object-contain p-4" onClick={(e) => e.stopPropagation()} />
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-surface/90 text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Предыдущее фото"
                disabled={index === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(index - 1);
                }}
                className="absolute left-3 flex size-11 items-center justify-center rounded-full bg-surface/90 text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Следующее фото"
                disabled={index === images.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(index + 1);
                }}
                className="absolute right-3 flex size-11 items-center justify-center rounded-full bg-surface/90 text-foreground disabled:opacity-30"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
