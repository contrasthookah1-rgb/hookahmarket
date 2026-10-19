import "server-only";
import { unstable_cache } from "next/cache";
import { hasDatabase, prisma } from "./db";

export const BLOG_PAGE_SIZE = 12;

export interface ArticleCard {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: Date;
}

const cardSelect = { id: true, slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true } as const;

type PublishedRow = Omit<ArticleCard, "publishedAt"> & { publishedAt: Date | null };
// published rows always have publishedAt (set on first publish in saveArticle)
const toCard = (r: PublishedRow): ArticleCard => ({ ...r, publishedAt: r.publishedAt ?? new Date(0) });

// Same short-lived cache + tag pattern as lib/catalog.ts; /admin/articles saves bust it.
const readPage = unstable_cache(
  async (page: number) => {
    const where = { published: true };
    const [rows, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * BLOG_PAGE_SIZE,
        take: BLOG_PAGE_SIZE,
        select: cardSelect,
      }),
      prisma.article.count({ where }),
    ]);
    return { rows, total };
  },
  ["blog-page"],
  { tags: ["blog"], revalidate: 60 }
);

export async function getPublishedArticles(page: number): Promise<{ articles: ArticleCard[]; total: number }> {
  if (!hasDatabase) return { articles: [], total: 0 };
  try {
    const { rows, total } = await readPage(page);
    // unstable_cache JSON-serializes: dates come back as strings
    return { articles: rows.map((r) => toCard({ ...r, publishedAt: r.publishedAt ? new Date(r.publishedAt) : null })), total };
  } catch (err) {
    console.error("[blog] DB read failed:", err);
    return { articles: [], total: 0 };
  }
}

/** Newest published articles except the one being read ("Другие статьи"). */
export async function getOtherArticles(excludeId: number, limit = 3): Promise<ArticleCard[]> {
  if (!hasDatabase) return [];
  try {
    const rows = await prisma.article.findMany({
      where: { published: true, id: { not: excludeId } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: cardSelect,
    });
    return rows.map(toCard);
  } catch (err) {
    console.error("[blog] DB read failed:", err);
    return [];
  }
}

/** Header/footer/sitemap show the blog only once there is something to read. */
export async function hasPublishedArticles(): Promise<boolean> {
  return (await getPublishedArticles(1)).total > 0;
}

export async function getArticleBySlug(slug: string) {
  if (!hasDatabase) return null;
  try {
    return await prisma.article.findUnique({ where: { slug } });
  } catch (err) {
    console.error("[blog] DB read failed:", err);
    return null;
  }
}

export async function getAllPublishedForSitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
  if (!hasDatabase) return [];
  try {
    return await prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
  } catch (err) {
    console.error("[blog] DB read failed:", err);
    return [];
  }
}

export const formatArticleDate = (d: Date) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Almaty" }).format(d);
