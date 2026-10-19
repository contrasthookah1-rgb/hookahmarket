import { LoungeTeaser } from "@/components/home/LoungeTeaser";
import { PromoSlides } from "@/components/home/PromoSlides";
import { PromoTiles } from "@/components/home/PromoTiles";
import { TrendingSection } from "@/components/home/TrendingSection";
import { Hero } from "@/components/layout/Hero";
import { getProducts } from "@/lib/catalog";
import { getLounge } from "@/lib/lounge";
import { getActiveHeroSlides, getHeroTiles } from "@/lib/hero-slides";

export default async function Home() {
  const [products, heroSlides, heroTiles, lounge] = await Promise.all([
    getProducts(),
    getActiveHeroSlides(),
    getHeroTiles(),
    getLounge(),
  ]);

  const inStockCount = products.filter((p) => p.stock > 0).length;

  return (
    <>
      <Hero productCount={inStockCount} tiles={heroTiles} />
      <PromoTiles productCount={inStockCount} />
      <PromoSlides slides={heroSlides} />
      <TrendingSection products={products} />
      {lounge?.enabled && <LoungeTeaser lounge={lounge} />}
    </>
  );
}
