"use client";

import { ChevronDown, Search, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CatalogMenu } from "@/components/layout/CatalogMenu";
import { Container } from "@/components/ui/Container";
import { Tooltip } from "@/components/ui/Tooltip";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { BRANCHES } from "@/lib/branches";
import { useCart } from "@/lib/cart-context";
import type { Category } from "@/lib/types";

// Ported from the approved final prototype (contrast-mockup-design-alternatives-nine
// .vercel.app, 2026-09-10): nav with the brand's gold "C" emblem (real logo mark,
// added 2026-09-22, cut from the client's PDF/PSD), fixed page links
// (categories live in the "☰ Каталог" menu next to the logo), and a search field.
// The dark utility bar above it was dropped 2026-09-10 and returned 2026-10-21 on the client's request.
// "О нас"/"Доставка" don't have pages yet — left out of the nav rather than shipped
// as dead, styled-like-a-link placeholders (UI/UX audit, 2026-09-10); add them back
// as real <Link>s once that content exists.
// Shown in the top strip (client, 2026-10-21); the WhatsApp number in the env var is separate.
const PHONE = "+7 747 387 7070";

export function Header({
  isLoggedIn,
  categories,
  loungeEnabled,
  blogEnabled,
}: {
  isLoggedIn: boolean;
  categories: Category[];
  loungeEnabled: boolean;
  blogEnabled: boolean;
}) {
  const { count, open } = useCart();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  // /catalog has its own live-filtering search in the sidebar (combines with
  // brand/price/strength facets) — showing this one too would be two search
  // boxes doing the same job on one screen, out of sync with each other
  // (UI/UX audit, 2026-09-17). Everywhere else this is the only way in.
  const isCatalogPage = usePathname().startsWith("/catalog");

  const topLink = "transition-colors duration-150 ease-standard hover:text-foreground";
  return (
    <>
      {/* First line (back on request, 2026-10-21; modelled on alphahookah.ru): scrolls away, only the main header below sticks. */}
      <div className="relative z-50 border-b border-border bg-surface font-body text-xs text-foreground-secondary sm:text-sm">
        <Container className="flex h-9 items-center justify-between gap-4">
          <nav aria-label="Информация" className="flex items-center gap-4 sm:gap-6">
            {loungeEnabled && (
              <Link href="/lounge" className={topLink}>
                Лаунж
              </Link>
            )}
            {blogEnabled && (
              <Link href="/blog" className={topLink}>
                Статьи
              </Link>
            )}
            <details className="group sm:relative">
              <summary className={`flex cursor-pointer list-none items-center gap-1 ${topLink} [&::-webkit-details-marker]:hidden`}>
                Адреса
                <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <ul className="absolute inset-x-5 top-full z-50 mt-1 sm:inset-x-auto sm:left-0 sm:w-72 rounded-md border border-border bg-surface py-1 shadow-lg">
                {Object.values(BRANCHES).map((b) => (
                  <li key={b.mapUrl}>
                    <a
                      href={b.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-foreground transition-colors duration-150 ease-standard hover:bg-surface-sunken"
                    >
                      {b.address}
                      <span className="block text-xs text-foreground-secondary">{b.hours}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </nav>
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="hidden md:inline">Астана</span>
            <a href={`tel:${PHONE.replace(/\s/g, "")}`} className={`hidden sm:inline ${topLink}`}>
              {PHONE}
            </a>
            <Link href={isLoggedIn ? "/account" : "/login"} className={topLink}>
              Личный кабинет
            </Link>
          </div>
        </Container>
      </div>
      <header className="sticky top-0 z-40">
      <div className="border-b border-gold-strong/50 bg-surface-inverse/95 backdrop-blur">
        <Container className="flex h-[72px] items-center gap-3 sm:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/logo-mark.png" alt="Contrast" width={279} height={344} className="h-9 w-auto" priority />
            <span className="font-body text-lg font-medium tracking-wider text-foreground-on-dark uppercase">
              Contrast
            </span>
          </Link>

          <CatalogMenu categories={categories} />

          {!isCatalogPage && (
            <form
              action="/catalog"
              className="hidden min-w-0 flex-1 items-center gap-2 rounded-sm border border-white/15 bg-white/10 px-4 py-2.5 transition-colors duration-150 ease-standard focus-within:border-gold hover:border-white/30 lg:flex"
            >
              <Search className="size-4 shrink-0 text-foreground-on-dark-muted" aria-hidden="true" />
              <input
                type="text"
                name="q"
                placeholder="Поиск по каталогу"
                aria-label="Поиск по каталогу"
                className="w-full min-w-0 bg-transparent font-body text-sm text-foreground-on-dark placeholder:text-foreground-on-dark-muted focus:outline-none"
              />
              <button type="submit" className="sr-only">
                Найти
              </button>
            </form>
          )}

          <div className="ml-auto flex items-center gap-0.5 sm:gap-2">
            {!isCatalogPage && (
              <Tooltip label="Поиск по каталогу">
                <Link
                  href="/catalog"
                  aria-label="Поиск по каталогу"
                  className="flex size-10 items-center sm:size-11 justify-center rounded-sm text-foreground-on-dark-muted transition-colors duration-150 ease-standard hover:bg-white/10 hover:text-foreground-on-dark lg:hidden"
                >
                  <Search className="size-[18px]" aria-hidden="true" />
                </Link>
              </Tooltip>
            )}
            {whatsappNumber && (
              <Tooltip label="Написать в WhatsApp">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Написать в WhatsApp"
                  className="hidden size-11 items-center sm:flex justify-center rounded-sm text-foreground-on-dark-muted transition-colors duration-150 ease-standard hover:bg-white/10 hover:text-foreground-on-dark"
                >
                  <WhatsAppIcon className="size-[18px]" />
                </a>
              </Tooltip>
            )}
            <Tooltip label="Личный кабинет">
              <Link
                href={isLoggedIn ? "/account" : "/login"}
                aria-label="Личный кабинет"
                className="flex size-10 items-center sm:size-11 justify-center rounded-sm text-foreground-on-dark-muted transition-colors duration-150 ease-standard hover:bg-white/10 hover:text-foreground-on-dark"
              >
                <User className="size-[18px]" aria-hidden="true" />
              </Link>
            </Tooltip>
            <Tooltip label="Корзина">
              <button
                type="button"
                onClick={open}
                aria-label={`Корзина${count > 0 ? `, товаров: ${count}` : ""}`}
                className="relative flex size-10 items-center sm:size-11 justify-center rounded-sm text-foreground-on-dark-muted transition-colors duration-150 ease-standard hover:bg-white/10 hover:text-foreground-on-dark"
              >
                <ShoppingBag className="size-[18px]" aria-hidden="true" />
                {count > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-gold-strong text-[10px] font-medium text-white">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>
            </Tooltip>
          </div>
        </Container>
      </div>
      </header>
    </>
  );
}
