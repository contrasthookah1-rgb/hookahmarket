import Link from "next/link";
import { LoungeImage } from "@/components/lounge/LoungeImage";
import { Container } from "@/components/ui/Container";
import type { LoungeView } from "@/lib/lounge";

// Short "Лаунж" block on the home page; rendered by the page only when the
// lounge is switched on in /admin/lounge.
export function LoungeTeaser({ lounge }: { lounge: LoungeView }) {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="relative isolate grid overflow-hidden rounded-md bg-surface-inverse lg:grid-cols-2">
          {lounge.heroImageUrl && (
            <div className="relative min-h-56 lg:order-2 lg:min-h-80">
              <LoungeImage src={lounge.heroImageUrl} alt={lounge.title} sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
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
