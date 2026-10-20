"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

// Native scroll-snap track; JS is only for the prev/next buttons. Slides are
// server-rendered and passed in as children.
export function LoungeCarousel({ children, controls }: { children: React.ReactNode; controls: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };
  const button =
    "absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface-inverse/70 text-foreground-on-dark transition-colors duration-150 ease-standard hover:bg-surface-inverse";

  return (
    <div className="absolute inset-0">
      <div
        ref={track}
        className="flex size-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {controls && (
        <>
          <button type="button" onClick={() => scroll(-1)} aria-label="Предыдущее фото" className={`${button} left-3`}>
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Следующее фото" className={`${button} right-3`}>
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
