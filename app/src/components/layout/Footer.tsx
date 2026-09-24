import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { BRANCHES, INSTAGRAM_URL } from "@/lib/branches";

const LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/account", label: "Личный кабинет" },
  { href: "/legal/pdn", label: "Согласие на обработку ПДн" },
];

export function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="bg-surface-inverse px-5 py-16 font-body text-sm text-foreground-on-dark-muted">
      <Container className="flex flex-wrap justify-between gap-10">
        <div className="flex flex-col gap-4">
          <div className="tracking-wider text-foreground-on-dark uppercase">Contrast</div>
          {Object.values(BRANCHES).map((b) => (
            <a
              key={b.mapUrl}
              href={b.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150 ease-standard hover:text-foreground-on-dark"
            >
              <div>{b.address}</div>
              <div className="text-xs">{b.hours}</div>
            </a>
          ))}
        </div>

        <nav aria-label="Дополнительная навигация" className="flex flex-col gap-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors duration-150 ease-standard hover:text-foreground-on-dark"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-start gap-4">
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors duration-150 ease-standard hover:text-foreground-on-dark"
            >
              <WhatsAppIcon className="size-4" />
              Написать в WhatsApp
            </a>
          )}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors duration-150 ease-standard hover:text-foreground-on-dark"
          >
            <InstagramIcon className="size-4" />
            Instagram
          </a>
          <div>© {new Date().getFullYear()} Contrast — Premium Hookah Shop</div>
        </div>
      </Container>
    </footer>
  );
}
