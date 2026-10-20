import Link from "next/link";
import { UploadedImage } from "@/components/ui/UploadedImage";
import { Container } from "@/components/ui/Container";
import { LoungeCarousel } from "@/components/home/LoungeCarousel";
import type { LoungeView } from "@/lib/lounge";

// Short "Лаунж" block on the home page; rendered by the page only when the
// lounge is switched on in /admin/lounge.
export function LoungeTeaser({ lounge }: { lounge: LoungeView }) {
  // hero, then venue photos, then the shared gallery; the same URL is shown once.
  // Not priority: the block is below the fold, next/image lazy-loads every slide.
  const all = [
    ...(lounge.heroImageUrl ? [{ url: lounge.heroImageUrl, alt: lounge.title }] : []),
    ...lounge.venues.flatMap((v) => v.images.map((i) => ({ url: i.url, alt: v.name }))),
    ...lounge.gallery.map((i) => ({ url: i.url, alt: lounge.title })),
  ];
  const slides = all.filter((s, i) => all.findIndex((o) => o.url === s.url) === i);

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="relative isolate grid overflow-hidden rounded-md bg-surface-inverse lg:grid-cols-2">
          {slides.length > 0 && (
            <div className="relative min-h-56 lg:order-2 lg:min-h-80">
              <LoungeCarousel controls={slides.length > 1}>
                {slides.map((s) => (
                  <div key={s.url} className="relative size-full shrink-0 snap-center">
                    <UploadedImage src={s.url} alt={s.alt} sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                  </div>
                ))}
              </LoungeCarousel>
            </div>
          )}
          <div className="flex flex-col items-start justify-center gap-4 p-8 lg:p-12">
            <h2 className="font-display text-3xl text-foreground-on-dark">{lounge.title}</h2>
            <p className="line-clamp-3 max-w-md font-body text-base text-foreground-on-dark-muted">{lounge.subtitle}</p>
            <Link
              href="/lounge"
              className="mt-2 inline-flex items-center justify-center rounded-sm px-7 py-[15px] font-body text-sm font-semibold text-ink-900 transition-transform duration-150 ease-standard hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--gold-300), var(--gold-700))" }}
            >
              Подробнее
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
