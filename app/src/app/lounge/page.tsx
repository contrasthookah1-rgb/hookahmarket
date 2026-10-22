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

// First photo of a set is shown large (2×2 on desktop), the rest fill around it —
// a uniform grid of identical tiles reads like a catalogue, not a room.
function Photos({ images, title }: { images: { id: number | string; url: string }[]; title: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {images.map((img, i) => (
        <div
          key={img.id}
          className={`relative overflow-hidden rounded-md bg-surface-sunken ${
            i === 0 ? "col-span-2 aspect-[4/3] sm:row-span-2 sm:aspect-auto sm:min-h-[28rem]" : "aspect-[3/4]"
          }`}
        >
          <UploadedImage
            src={img.url}
            alt={`${title} — фото ${i + 1}`}
            sizes={i === 0 ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 25vw, 50vw"}
            className="object-cover transition-transform duration-500 ease-standard hover:scale-[1.03]"
          />
        </div>
      ))}
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

      {/* Hero: the room itself, headline sitting low on the photo, and the practical
          facts (where / until when) right under it instead of further down the page. */}
      <section className="relative isolate flex min-h-[34rem] items-end overflow-hidden bg-surface-inverse lg:min-h-[40rem]">
        {lounge.heroImageUrl && (
          <UploadedImage src={lounge.heroImageUrl} alt="Contrast Lounge — кальянная в Астане" sizes="100vw" priority className="-z-10 object-cover" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <Container className="pb-10 pt-32 sm:pb-14">
          <h1
            className="rise max-w-4xl font-display text-5xl leading-[1.02] text-foreground-on-dark sm:text-7xl lg:text-8xl"
            style={{ ["--rise-delay" as string]: "0ms" }}
          >
            {lounge.title}
          </h1>
          <p
            className="rise mt-5 max-w-xl font-body text-base text-foreground-on-dark-muted sm:text-lg"
            style={{ ["--rise-delay" as string]: "120ms" }}
          >
            {lounge.subtitle}
          </p>
          <div className="rise mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" style={{ ["--rise-delay" as string]: "240ms" }}>
            <ul className="grid gap-x-10 gap-y-4 font-body text-sm text-foreground-on-dark sm:grid-cols-2">
              {lounge.venues.map((v) => (
                <li key={v.id} className="border-t border-white/25 pt-3">
                  <div className="font-semibold">{v.address}</div>
                  <div className="text-foreground-on-dark-muted">{v.hours}</div>
                </li>
              ))}
            </ul>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${bookingText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center rounded-sm px-7 py-[15px] font-body text-sm font-semibold text-ink-900 transition-transform duration-150 ease-standard hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, var(--gold-300), var(--gold-700))" }}
              >
                Забронировать стол
              </a>
            )}
          </div>
        </Container>
      </section>

      {lounge.bodyHtml && (
        <section className="py-16 sm:py-24">
          <Container>
            <RichText html={lounge.bodyHtml} className="mx-auto max-w-2xl text-lg" />
          </Container>
        </section>
      )}

      {lounge.venues.map((v) => (
        <section key={v.id} className="border-t border-border py-12 sm:py-16">
          <Container>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-14">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <h2 className="font-display text-3xl text-foreground sm:text-4xl">{v.name}</h2>
                <dl className="mt-5 grid gap-3 font-body text-base text-foreground-secondary">
                  <div>
                    <dt className="text-sm text-foreground-muted">Адрес</dt>
                    <dd>{v.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-foreground-muted">Часы работы</dt>
                    <dd>{v.hours}</dd>
                  </div>
                </dl>
                {v.mapUrl && (
                  <a
                    href={v.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-fit items-center gap-2 font-body text-base text-foreground-accent underline-offset-4 transition-colors duration-150 ease-standard hover:underline"
                  >
                    <MapPin className="size-4" aria-hidden="true" />
                    Открыть в 2ГИС
                  </a>
                )}
              </div>
              {v.images.length > 0 && <Photos images={v.images} title={`${lounge.title}, ${v.name}`} />}
            </div>
          </Container>
        </section>
      ))}

      {lounge.gallery.length > 0 && (
        <section className="bg-surface-sunken py-12 sm:py-16">
          <Container>
            <h2 className="mb-8 font-display text-3xl text-foreground sm:text-4xl">Атмосфера</h2>
            <Photos images={lounge.gallery} title={lounge.title} />
          </Container>
        </section>
      )}
    </>
  );
}
