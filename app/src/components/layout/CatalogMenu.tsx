"use client";

import { ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";

// "☰ Каталог" next to the logo (client request 2026-10-02, reference
// alphahookah.ru) — replaces the category strip that used to sit under the
// home hero. Click toggles; outside click / Esc / picking a link closes.
// Desktop: dropdown under the button. Phone: full-width sheet under the header.
export function CatalogMenu({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const itemClass =
    "flex items-center justify-between px-5 py-3.5 font-body text-base text-foreground transition-colors duration-150 ease-standard hover:bg-surface-sunken lg:px-4 lg:py-2.5 lg:text-sm";

  return (
    <div ref={ref} className="shrink-0 lg:relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Каталог"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-sm px-3 font-body text-sm font-semibold text-ink-900 transition-transform duration-150 ease-standard hover:scale-[1.02] active:scale-[0.98] sm:px-5"
        style={{ background: "linear-gradient(135deg, var(--gold-300), var(--gold-600))" }}
      >
        {isOpen ? <X className="size-[18px]" aria-hidden="true" /> : <Menu className="size-[18px]" aria-hidden="true" />}
        <span className="hidden sm:inline">Каталог</span>
      </button>

      {isOpen && (
        <nav
          aria-label="Категории каталога"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-72px)] overflow-y-auto border-b border-border bg-surface shadow-lg lg:inset-x-auto lg:left-0 lg:mt-2 lg:max-h-[70vh] lg:w-80 lg:rounded-md lg:border"
        >
          <ul className="py-1">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/catalog?category=${encodeURIComponent(c.label)}`}
                  onClick={() => setIsOpen(false)}
                  className={itemClass}
                >
                  {c.label}
                  <ChevronRight className="size-4 text-foreground-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
            <li className="border-t border-border">
              <Link
                href="/catalog"
                onClick={() => setIsOpen(false)}
                className={`${itemClass} font-medium text-gold-strong`}
              >
                Весь каталог
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
