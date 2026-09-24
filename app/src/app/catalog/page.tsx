import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { Container } from "@/components/ui/Container";
import { getCategories, getProducts } from "@/lib/catalog";

export async function generateMetadata({
  searchParams,
}: PageProps<"/catalog">): Promise<Metadata> {
  const params = await searchParams;
  const categoryParam = params.category;
  const category = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  return {
    title: category ? `${category} — купить в Астане` : "Каталог кальянов, табака и аксессуаров",
    description: `${category ?? "Кальяны, табак, бестабачные смеси и аксессуары"} в Hookah Market Contrast, Астана. Актуальные цены и наличие, самовывоз и доставка.`,
    alternates: {
      canonical: category ? `/catalog?category=${encodeURIComponent(category)}` : "/catalog",
    },
  };
}

export default async function CatalogPage({
  searchParams,
}: PageProps<"/catalog">) {
  const params = await searchParams;
  const categoryParam = params.category;
  const initialCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const queryParam = params.q;
  const initialQuery = Array.isArray(queryParam) ? queryParam[0] : queryParam;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <Container>
      <CatalogClient
        initialCategory={initialCategory}
        initialQuery={initialQuery}
        categories={categories}
        products={products}
      />
    </Container>
  );
}
