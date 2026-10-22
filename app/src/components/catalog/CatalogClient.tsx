"use client";

import { Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CATEGORY_SEO } from "@/lib/category-seo";
import { parsePrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const PAGE_SIZE = 24;

type SortOption = "popular" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "По популярности" },
  { value: "price_asc", label: "Цена: сначала дешёвые" },
  { value: "price_desc", label: "Цена: сначала дорогие" },
];

export function CatalogClient({
  initialCategory,
  initialQuery,
  categories,
  products,
}: {
  initialCategory?: string;
  initialQuery?: string;
  categories: Category[];
  products: Product[];
}) {
  const [category, setCategory] = useState<string | null>(initialCategory ?? null);
  const [brands, setBrands] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [packagings, setPackagings] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [query, setQuery] = useState(initialQuery ?? "");
  const [sort, setSort] = useState<SortOption>("popular");
  const [brandQuery, setBrandQuery] = useState("");
  const [brandsExpanded, setBrandsExpanded] = useState(false);

  const BRAND_COLLAPSE_COUNT = 8;

  // Re-derive category/query from the URL when they change (e.g. clicking a
  // header/footer category link, or submitting the header's search form,
  // while already on /catalog) — adjusted during render, per React's
  // guidance, instead of in an effect. Category reset also clears the
  // now-stale facet picks; query doesn't touch them.
  const [prevInitial, setPrevInitial] = useState({ category: initialCategory, query: initialQuery });
  if (initialCategory !== prevInitial.category || initialQuery !== prevInitial.query) {
    if (initialCategory !== prevInitial.category) {
      setCategory(initialCategory ?? null);
      setBrands([]);
      setStrengths([]);
      setPackagings([]);
    }
    if (initialQuery !== prevInitial.query) setQuery(initialQuery ?? "");
    setPrevInitial({ category: initialCategory, query: initialQuery });
  }

  // Facet options scoped to the selected category, not the whole catalog —
  // otherwise picking "Кальяны" still listed tobacco brands (Al Fakher,
  // Adalya...) that don't exist on a single hookah, while accessories/bowls/
  // hookahs/cigars/coals never got a brand parsed from Poster at all (see
  // lib/poster/parser.ts) and so always showed an empty, useless "Бренд"
  // list (audit 2026-09-10). Hiding the section when it has no options, and
  // resetting stale brand/strength/packaging picks on category change (below),
  // are the other halves of this fix — a leftover pick from a previous
  // category would otherwise silently zero out every result.
  const categoryProducts = useMemo(
    () => (category ? products.filter((p) => p.category === category) : products),
    [products, category]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return counts;
  }, [products]);

  const allBrands = useMemo(
    () => [...new Set(categoryProducts.map((p) => p.brand).filter(Boolean))],
    [categoryProducts]
  );
  const matchingBrands = useMemo(
    () => allBrands.filter((b) => b.toLowerCase().includes(brandQuery.toLowerCase())),
    [allBrands, brandQuery]
  );
  const visibleBrands =
    brandsExpanded || brandQuery ? matchingBrands : matchingBrands.slice(0, BRAND_COLLAPSE_COUNT);
  const allStrengths = useMemo(
    () => [...new Set(categoryProducts.map((p) => p.strength).filter((v): v is string => Boolean(v)))],
    [categoryProducts]
  );
  const allPackagings = useMemo(
    () => [...new Set(categoryProducts.map((p) => p.packaging).filter((v): v is string => Boolean(v)))],
    [categoryProducts]
  );

  const toggle = (setter: (updater: (prev: string[]) => string[]) => void, value: string) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const changeCategory = (value: string | null) => {
    setCategory(value);
    setBrands([]);
    setStrengths([]);
    setPackagings([]);
    setBrandQuery("");
    setBrandsExpanded(false);
  };

  const min = priceMin ? Number(priceMin) : null;
  const max = priceMax ? Number(priceMax) : null;

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      const price = parsePrice(p.price);
      return (
        (!category || p.category === category) &&
        (brands.length === 0 || brands.includes(p.brand)) &&
        (strengths.length === 0 || (p.strength && strengths.includes(p.strength))) &&
        (packagings.length === 0 || (p.packaging && packagings.includes(p.packaging))) &&
        (min === null || price >= min) &&
        (max === null || price <= max) &&
        (!query || p.name.toLowerCase().includes(query.toLowerCase()))
      );
    });
    if (sort === "price_asc") result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sort === "price_desc") result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    return result;
  }, [category, brands, strengths, packagings, min, max, query, sort, products]);

  // Page numbers snap back to 1 whenever any filter/sort/search changes
  // (resetKey differs from the one the page was set under).
  const resetKey = JSON.stringify([category, brands, strengths, packagings, min, max, query, sort]);
  const [current, setCurrent] = useState({ key: resetKey, page: 1 });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(current.key === resetKey ? current.page : 1, totalPages);
  const gridTop = useRef<HTMLDivElement>(null);
  const goToPage = (next: number) => {
    setCurrent({ key: resetKey, page: next });
    gridTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // 1 … 4 5 6 … 20 — always first, last, and the neighbours of the current page
  const pageItems = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .flatMap((n, i, arr) => (i > 0 && n - arr[i - 1] > 1 ? ["gap" as const, n] : [n]));

  return (
    <div className="py-6 lg:py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-foreground lg:text-5xl">{category ?? "Каталог"}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="flex flex-row flex-wrap gap-6 lg:flex-col">
          <div className="flex-1 basis-full lg:flex-none lg:basis-auto">
            <Input
              name="catalog-search"
              placeholder="Поиск по каталогу"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<Search className="size-4" aria-hidden="true" />}
            />
          </div>

          {/* Categories on the left (client, 2026-10-22); brand/strength/pack facets appear once one is picked. */}
          <div className="min-w-0 basis-full lg:basis-auto">
            <div className="mb-3 font-body text-xs tracking-wide text-foreground-secondary uppercase">
              Категории
            </div>
            <div
              className="flex gap-2.5 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0"
              style={{ scrollbarWidth: "thin" }}
            >
              {[{ id: 0, label: null as string | null, text: "Все" }, ...categories.map((c) => ({ id: c.id, label: c.label as string | null, text: c.label }))].map(
                (c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={category === c.label}
                    onClick={() => changeCategory(c.label)}
                    className={`flex shrink-0 cursor-pointer items-center justify-between gap-3 rounded-full border px-4 py-2 text-left font-body text-sm whitespace-nowrap transition-colors duration-150 ease-standard lg:w-full lg:rounded-sm lg:border-0 lg:px-3 lg:whitespace-normal ${
                      category === c.label
                        ? "border-foreground bg-foreground text-foreground-on-dark lg:bg-surface-sunken lg:font-medium lg:text-foreground lg:shadow-[inset_2px_0_0_var(--gold-500)]"
                        : "border-border bg-surface text-foreground hover:border-foreground-secondary lg:hover:bg-surface-sunken"
                    }`}
                  >
                    {c.text}
                    <span className="hidden text-xs text-foreground-muted lg:inline">
                      {c.label ? (categoryCounts.get(c.label) ?? 0) : products.length}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          {category && allBrands.length > 0 && (
            <div>
              <div className="mb-3 font-body text-xs tracking-wide text-foreground-secondary uppercase">
                Бренд
              </div>
              {allBrands.length > BRAND_COLLAPSE_COUNT && (
                <div className="mb-3">
                  <Input
                    name="brand-search"
                    placeholder="Поиск по бренду"
                    value={brandQuery}
                    onChange={(e) => setBrandQuery(e.target.value)}
                    icon={<Search className="size-4" aria-hidden="true" />}
                  />
                </div>
              )}
              <div className="flex flex-row flex-wrap gap-3 lg:flex-col">
                {visibleBrands.map((b) => (
                  <Checkbox
                    key={b}
                    label={b}
                    checked={brands.includes(b)}
                    onChange={() => toggle(setBrands, b)}
                    count={categoryProducts.filter((p) => p.brand === b).length}
                  />
                ))}
                {visibleBrands.length === 0 && (
                  <span className="font-body text-sm text-foreground-muted">Бренды не найдены</span>
                )}
              </div>
              {!brandQuery && matchingBrands.length > BRAND_COLLAPSE_COUNT && (
                <button
                  type="button"
                  onClick={() => setBrandsExpanded((prev) => !prev)}
                  className="mt-3 font-body text-sm text-foreground-secondary underline underline-offset-2 transition-colors duration-150 ease-standard hover:text-foreground"
                >
                  {brandsExpanded ? "Свернуть" : `Показать все (${matchingBrands.length})`}
                </button>
              )}
            </div>
          )}

          {category && allStrengths.length > 0 && (
            <div>
              <div className="mb-3 font-body text-xs tracking-wide text-foreground-secondary uppercase">
                Крепость
              </div>
              <div className="flex flex-row flex-wrap gap-3 lg:flex-col">
                {allStrengths.map((s) => (
                  <Checkbox
                    key={s}
                    label={s}
                    checked={strengths.includes(s)}
                    onChange={() => toggle(setStrengths, s)}
                  />
                ))}
              </div>
            </div>
          )}

          {category && allPackagings.length > 0 && (
            <div>
              <div className="mb-3 font-body text-xs tracking-wide text-foreground-secondary uppercase">
                Фасовка
              </div>
              <div className="flex flex-row flex-wrap gap-3 lg:flex-col">
                {allPackagings.map((p) => (
                  <Checkbox
                    key={p}
                    label={p}
                    checked={packagings.includes(p)}
                    onChange={() => toggle(setPackagings, p)}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-3 font-body text-xs tracking-wide text-foreground-secondary uppercase">
              Цена, ₸
            </div>
            <div className="flex gap-2">
              <Input
                name="price-min"
                type="number"
                placeholder="От"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <Input
                name="price-max"
                type="number"
                placeholder="До"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="font-body text-sm text-foreground-secondary">
              {filtered.length} товаров
            </span>
            <div className="w-full sm:w-[220px]">
              <Select
                options={SORT_OPTIONS}
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
              />
            </div>
          </div>
          <div ref={gridTop} className="scroll-mt-24 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <nav aria-label="Страницы каталога" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => goToPage(page - 1)}>
                ← Назад
              </Button>
              {pageItems.map((item, i) =>
                item === "gap" ? (
                  <span key={`gap-${i}`} className="px-1 font-body text-foreground-muted" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={item === page ? "primary" : "ghost"}
                    size="sm"
                    aria-current={item === page ? "page" : undefined}
                    aria-label={`Страница ${item}`}
                    onClick={() => goToPage(item)}
                  >
                    {item}
                  </Button>
                )
              )}
              <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => goToPage(page + 1)}>
                Вперёд →
              </Button>
            </nav>
          )}
          {filtered.length === 0 && (
            <div className="py-16 text-center font-body text-foreground-muted">
              Ничего не найдено
            </div>
          )}
        </div>
      </div>
      {CATEGORY_SEO[category ?? ""] && (
        <section className="mt-16 max-w-3xl space-y-3 border-t border-border pt-8 font-body text-sm leading-relaxed text-foreground-secondary">
          {CATEGORY_SEO[category ?? ""].map((text) => (
            <p key={text}>{text}</p>
          ))}
        </section>
      )}
    </div>
  );
}
