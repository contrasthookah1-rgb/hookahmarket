"use client";

import { Check, PackageSearch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCart } from "@/lib/cart-context";
import { getCategoryImage } from "@/lib/category-images";
import type { Product } from "@/lib/types";

// No "Описание" tab: Poster gives us brand/flavor/strength/packaging (see
// lib/poster/parser.ts) but never free-text per-product copy, so there is no
// real description to show. A previous version filled the gap with one
// hardcoded paragraph for every product ("Насыщенный вкус, стабильные
// характеристики") — shipped on things like lighter fluid, which made it
// actively wrong rather than just generic (caught 2026-09-10).
// No "Отзывы" tab either: there is nowhere on the site for a customer to
// actually leave a review, so it only ever showed "Пока нет отзывов" —
// removed rather than left as a dead promise (caught 2026-09-16).

export function ProductDetailClient({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const categoryImage = getCategoryImage(product.category);
  const specs: [string, string][] = product.specs?.length
    ? product.specs.map((s) => [s.label, s.value])
    : ([
        ["Бренд", product.brand],
        ["Вкус", product.flavor],
        ["Крепость", product.strength],
        ["Фасовка", product.packaging],
      ] as [string, string | undefined][]).filter((r): r is [string, string] => Boolean(r[1]));
  if (product.stock > 0) specs.push(["Остаток", `${product.stock} шт`]);

  const handleAddToCart = () => {
    addItem(product, qty);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="py-6 lg:py-8">
      <Link href="/catalog" className="font-body text-sm text-foreground-secondary">
        ← Назад в каталог
      </Link>

      <div className="mt-6 grid gap-7 lg:grid-cols-2 lg:gap-14">
        {product.gallery?.length ? (
          <ProductGallery images={product.gallery} alt={product.name} />
        ) : (
        <div className="relative aspect-square overflow-hidden rounded-md bg-surface-sunken">
          {product.imageUrl ? (
            // Real per-product photo from an arbitrary supplier/brand site —
            // plain <img>, see ProductCard.tsx for why.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.category}
              className="absolute inset-0 size-full object-cover"
            />
          ) : categoryImage ? (
            <Image
              src={categoryImage.url}
              alt={product.category}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-foreground-muted">
              <PackageSearch className="size-16" strokeWidth={1} aria-hidden="true" />
            </div>
          )}
        </div>
        )}

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-2 font-body text-sm text-foreground-muted">
            {product.category}
            {product.brand ? `, ${product.brand}` : ""}
          </div>
          <h1 className="mb-5 font-display text-3xl leading-tight text-foreground lg:text-5xl">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl text-foreground">{product.price}</span>
            {product.oldPrice && (
              <span className="font-body text-lg text-foreground-muted line-through">
                {product.oldPrice}
              </span>
            )}
          </div>
          <p
            className={`mt-3 flex items-center gap-2 font-body text-sm ${
              product.stock > 0 && product.stock <= 5 ? "text-danger" : product.stock > 0 ? "text-success" : "text-foreground-muted"
            }`}
          >
            <span aria-hidden="true" className="size-2 rounded-full bg-current" />
            {product.stock > 0
              ? product.stock <= 5
                ? `Осталось ${product.stock} шт`
                : "В наличии"
              : "Ожидаем поставку"}
          </p>

          {product.stock > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <QuantityStepper value={qty} onChange={setQty} max={product.stock} />
              <Button variant="primary" size="lg" className="min-w-48 flex-1 sm:flex-none" onClick={handleAddToCart}>
                {justAdded ? (
                  <>
                    <Check className="size-4" aria-hidden="true" /> Добавлено
                  </>
                ) : (
                  "В корзину"
                )}
              </Button>
            </div>
          )}

          {specs.length > 0 && (
            <dl className="mt-8 border-t border-border font-body text-base">
              {specs.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 border-b border-border py-3">
                  <dt className="text-foreground-muted">{label}</dt>
                  <dd className="text-right text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {product.description && (
            <div className="mt-8">
              <h2 className="mb-3 font-display text-xl text-foreground">Описание</h2>
              <RichText html={product.description} />
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 lg:mt-24">
          <h2 className="mb-5 font-display text-2xl text-foreground">Похожие товары</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
