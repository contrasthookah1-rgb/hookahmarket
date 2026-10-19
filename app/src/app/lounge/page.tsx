import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { BRANCHES, type Branch } from "@/lib/branches";

export const metadata: Metadata = {
  title: "Лаунж",
  description:
    "Лаундж-бары Contrast в Астане: Аль-Фараби, 9/2 и Мухамедханова, 4В. Адреса, часы работы и фото.",
};

// Photos supplied by the client 2026-10-19 (originals in 191026/, resized to
// public/lounge). All are 2:3 portraits except the Al-Farabi hero (3:2).
// The last three had no caption — kept in the shared gallery, not tied to a branch.
const photo = (name: string) => ({ src: `/lounge/${name}.jpg`, width: 1400, height: 2100 });

const LOUNGES: { branch: Branch; name: string; photos: ReturnType<typeof photo>[] }[] = [
  {
    branch: "alfarabi",
    name: "Аль-Фараби",
    photos: [photo("alfarabi-1"), photo("alfarabi-2")],
  },
  {
    branch: "left",
    name: "Мухамедханова",
    photos: [photo("mukhamedkhanova-1")],
  },
];

const GALLERY = [photo("gallery-1"), photo("gallery-2"), photo("gallery-3")];

// Portrait tiles: 2 columns on phones, 3 on desktop inside a 1280px container.
const TILE_SIZES = "(min-width: 1280px) 400px, (min-width: 640px) 33vw, 50vw";

function Tile({ src, width, height }: { src: string; width: number; height: number }) {
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt="Интерьер лаундж-бара Contrast"
      sizes={TILE_SIZES}
      className="h-auto w-full rounded-md bg-surface-sunken"
    />
  );
}

export default function LoungePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-surface-inverse">
        <Image
          src="/lounge/alfarabi-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover opacity-60"
        />
        <Container className="py-20 sm:py-28 lg:py-40">
          <h1 className="font-display text-4xl text-foreground-on-dark sm:text-5xl">Лаунж</h1>
          <p className="mt-4 max-w-xl font-body text-base text-foreground-on-dark-muted">
            Две точки в Астане: кальян, чай и тёмные залы до глубокой ночи.
          </p>
        </Container>
      </section>

      {LOUNGES.map(({ branch, name, photos }) => {
        const b = BRANCHES[branch];
        return (
          <section key={branch} className="py-12 sm:py-16">
            <Container>
              <h2 className="font-display text-2xl text-foreground sm:text-3xl">{name}</h2>
              <div className="mt-4 flex flex-col gap-1 font-body text-base text-foreground-secondary">
                <div>{b.address}</div>
                <div>{b.hours}</div>
                <a
                  href={b.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-fit items-center gap-2 text-foreground-accent underline-offset-4 transition-colors duration-150 ease-standard hover:underline"
                >
                  <MapPin className="size-4" aria-hidden="true" />
                  Открыть в 2ГИС
                </a>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {photos.map((p) => (
                  <Tile key={p.src} {...p} />
                ))}
              </div>
            </Container>
          </section>
        );
      })}

      <section className="bg-surface-sunken py-12 sm:py-16">
        <Container>
          <h2 className="font-display text-2xl text-foreground sm:text-3xl">Атмосфера</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {GALLERY.map((p) => (
              <Tile key={p.src} {...p} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
