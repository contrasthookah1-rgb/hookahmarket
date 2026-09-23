import { CategoryPills } from "@/components/home/CategoryPills";
import { PromoSlides } from "@/components/home/PromoSlides";
import { PromoTiles } from "@/components/home/PromoTiles";
import { TrendingSection } from "@/components/home/TrendingSection";
import { Hero } from "@/components/layout/Hero";
import { getCategories, getProducts } from "@/lib/catalog";
import { getActiveHeroSlides, getHeroTiles } from "@/lib/hero-slides";

export default async function Home() {
  const [categories, products, heroSlides, heroTiles] = await Promise.all([
    getCategories(),
    getProducts(),
    getActiveHeroSlides(),
    getHeroTiles(),
  ]);

  const inStockCount = products.filter((p) => p.stock > 0).length;

  return (
    <>
      <Hero productCount={inStockCount} tiles={heroTiles} />
      <CategoryPills categories={categories} />
      <PromoTiles productCount={inStockCount} />
      <PromoSlides slides={heroSlides} />
      <TrendingSection products={products} />
    </>
  );
}
