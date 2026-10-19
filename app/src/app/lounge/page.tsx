import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UploadedImage } from "@/components/ui/UploadedImage";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { getLounge } from "@/lib/lounge";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://contrast.example.kz";

export async function generateMetadata(): Promise<Metadata> {
  const lounge = await getLounge();
  const places = lounge?.venues.map((v) => v.address).join(" и ");
  return {
    title: "Лаунж",
    description: `Лаундж-бары Contrast в Астане${places ? `: ${places}` : ""}. Адреса, часы работы и фото.`,
    alternates: { canonical: "/lounge" },
  };
}

// Portrait tiles: 2 columns on phones, 3 on desktop inside a 1280px container.
const TILE_SIZES = "(min-width: 1280px) 400px, (min-width: 640px) 33vw, 50vw";

function Tile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface-sunken">
      <UploadedImage src={src} alt={alt} sizes={TILE_SIZES} className="object-cover" />
    </div>
  );
}

export default async function LoungePage() {
  const lounge = await getLounge();
  if (!lounge?.enabled) notFound();

  const whatsapp = lounge.whatsappNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const bookingText = encodeURIComponent("Здравствуйте! Хочу забронировать стол в Contrast Lounge.");

  const jsonLd = lounge.venues.map((v) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${lounge.title} — ${v.name}`,
    url: `${SITE_URL}/lounge`,
    image: v.images[0] ? new URL(v.images[0].url, SITE_URL).toString() : undefined,
    address: { "@type": "PostalAddress", streetAddress: v.address, addressLocality: "Астана", addressCountry: "KZ" },
    hasMap: v.mapUrl || undefined,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative isolate overflow-hidden bg-surface-inverse">
        {lounge.heroImageUrl && (
          <UploadedImage src={lounge.heroImageUrl} alt="" sizes="100vw" priority className="-z-10 object-cover opacity-60" />
        )}
        <Container className="py-20 sm:py-28 lg:py-40">
          <h1 className="font-display text-4xl text-foreground-on-dark sm:text-5xl">{lounge.title}</h1>
          <p className="mt-4 max-w-xl font-body text-base text-foreground-on-dark-muted">{lounge.subtitle}</p>
        </Container>
      </section>

      {lounge.bodyHtml && (
        <section className="py-12 sm:py-16">
          <Container>
            <RichText html={lounge.bodyHtml} className="max-w-2xl" />
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${bookingText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center rounded-sm px-7 py-[15px] font-body text-sm font-semibold text-ink-900 transition-transform duration-150 ease-standard hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, var(--gold-300), var(--gold-700))" }}
              >
                Забронировать стол
              </a>
            )}
          </Container>
        </section>
      )}

      {lounge.venues.map((v) => (
        <section key={v.id} className="border-t border-border py-12 sm:py-16">
          <Container>
            <h2 className="font-display text-2xl text-foreground sm:text-3xl">{v.name}</h2>
            <div className="mt-4 flex flex-col gap-1 font-body text-base text-foreground-secondary">
              <div>{v.address}</div>
              <div>{v.hours}</div>
              {v.mapUrl && (
                <a
                  href={v.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-fit items-center gap-2 text-foreground-accent underline-offset-4 transition-colors duration-150 ease-standard hover:underline"
                >
                  <MapPin className="size-4" aria-hidden="true" />
                  Открыть в 2ГИС
                </a>
              )}
            </div>
            {v.images.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {v.images.map((img, i) => (
                  <Tile key={img.id} src={img.url} alt={`${lounge.title} на ${v.name} — зал ${i + 1}`} />
                ))}
              </div>
            )}
          </Container>
        </section>
      ))}

      {lounge.gallery.length > 0 && (
        <section className="bg-surface-sunken py-12 sm:py-16">
          <Container>
            <h2 className="font-display text-2xl text-foreground sm:text-3xl">Атмосфера</h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {lounge.gallery.map((img, i) => (
                <Tile key={img.id} src={img.url} alt={`${lounge.title} — атмосфера ${i + 1}`} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
