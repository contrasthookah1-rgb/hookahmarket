import "server-only";
import { getCategoryImage } from "./category-images";
import { hasDatabase, prisma } from "./db";
import type { HeroSlide } from "@prisma/client";

export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  if (!hasDatabase) return [];
  try {
    return await prisma.heroSlide.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  } catch (err) {
    console.error("[hero-slides] DB read failed:", err);
    return [];
  }
}

export interface HeroTileView {
  imageUrl: string;
  linkUrl: string;
  label: string;
}

// Defaults for the home hero's 2x2 grid — a slot shows its category photo
// until Алуа sets her own image + link for it in /admin/hero-slides.
const DEFAULT_TILE_CATEGORIES = ["Кальяны", "Табачные смеси для кальяна", "Чаши", "Аксессуары"];

export const DEFAULT_HERO_TILES: HeroTileView[] = DEFAULT_TILE_CATEGORIES.map((category) => ({
  imageUrl: getCategoryImage(category)?.url ?? "",
  linkUrl: `/catalog?category=${encodeURIComponent(category)}`,
  label: category,
}));

export async function getHeroTiles(): Promise<HeroTileView[]> {
  if (!hasDatabase) return DEFAULT_HERO_TILES;
  try {
    const rows = await prisma.heroTile.findMany();
    const bySlot = new Map(rows.map((r) => [r.slot, r]));
    return DEFAULT_HERO_TILES.map((fallback, slot) => {
      const row = bySlot.get(slot);
      return row ? { imageUrl: row.imageUrl, linkUrl: row.linkUrl, label: `Баннер ${slot + 1}` } : fallback;
    });
  } catch (err) {
    console.error("[hero-slides] hero tiles DB read failed:", err);
    return DEFAULT_HERO_TILES;
  }
}
