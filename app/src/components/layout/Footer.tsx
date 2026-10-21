import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { BRANCHES, INSTAGRAM_URL } from "@/lib/branches";

const LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/lounge", label: "Лаунж" },
  { href: "/blog", label: "Статьи" },
  { href: "/account", label: "Личный кабинет" },
  { href: "/legal/pdn", label: "Согласие на обработку ПДн" },
];

const HEADING = "text-xs font-medium tracking-wider text-foreground-on-dark uppercase";
const LINK = "transition-colors duration-150 ease-standard hover:text-foreground-on-dark";

export function Footer({
  loungeEnabled,
  blogEnabled,
  isLoggedIn,
}: {
  loungeEnabled: boolean;
  blogEnabled: boolean;
  isLoggedIn: boolean;
}) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="bg-surface-inverse px-5 py-14 font-body text-sm text-foreground-on-dark-muted">
      <Container>
        {/* Every column opens with a heading on the same line, so the tops align. */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_1.5fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <div className={HEADING}>Contrast</div>
            <p className="max-w-56">Premium Hookah Shop и лаунж-бары в Астане</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className={HEADING}>Адреса</div>
            {Object.values(BRANCHES).map((b) => (
              <a key={b.mapUrl} href={b.mapUrl} target="_blank" rel="noopener noreferrer" className={`${LINK} flex flex-col gap-0.5`}>
                <span className="text-foreground-on-dark">{b.address}</span>
                <span className="text-xs">{b.note}</span>
                <span className="text-xs">{b.hours}</span>
              </a>
            ))}
          </div>

          <nav aria-label="Дополнительная навигация" className="flex flex-col gap-3">
            <div className={HEADING}>Навигация</div>
            {LINKS.filter((link) => (link.href !== "/lounge" || loungeEnabled) && (link.href !== "/blog" || blogEnabled)).map((link) => (
              <Link key={link.href} href={link.href === "/account" && !isLoggedIn ? "/login" : link.href} className={LINK}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-3">
            <div className={HEADING}>Связаться</div>
            {whatsappNumber && (
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className={`${LINK} inline-flex items-center gap-2`}>
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </a>
            )}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={`${LINK} inline-flex items-center gap-2`}>
              <InstagramIcon className="size-4" />
              Instagram
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs sm:flex-row sm:justify-between">
          <div>© {new Date().getFullYear()} Contrast</div>
        </div>
      </Container>
    </footer>
  );
}
