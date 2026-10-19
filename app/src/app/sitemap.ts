import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { getLounge } from "@/lib/lounge";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://contrast.example.kz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, lounge] = await Promise.all([getCategories(), getProducts(), getLounge()]);

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalog`, changeFrequency: "daily", priority: 0.9 },
    ...(lounge?.enabled ? [{ url: `${SITE_URL}/lounge`, changeFrequency: "monthly" as const, priority: 0.7 }] : []),
    ...categories.map((c) => ({
      url: `${SITE_URL}/catalog?category=${encodeURIComponent(c.label)}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
