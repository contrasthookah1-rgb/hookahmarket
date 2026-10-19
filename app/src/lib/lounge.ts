import "server-only";
import { unstable_cache } from "next/cache";
import { hasDatabase, prisma } from "./db";

export interface LoungeVenueView {
  id: number;
  name: string;
  address: string;
  hours: string;
  mapUrl: string;
  images: { id: number; url: string }[];
}

export interface LoungeView {
  enabled: boolean;
  title: string;
  subtitle: string;
  bodyHtml: string;
  heroImageUrl: string | null;
  whatsappNumber: string | null;
  venues: LoungeVenueView[];
  gallery: { id: number; url: string }[];
}

// Same short-lived cache as the catalog reads (every page's header/footer
// asks whether the lounge is on); /admin/lounge saves bust it with updateTag.
const readLounge = unstable_cache(
  async (): Promise<LoungeView | null> => {
    const [settings, venues, gallery] = await Promise.all([
      prisma.loungeSettings.findUnique({ where: { id: 1 } }),
      prisma.loungeVenue.findMany({
        orderBy: { sortOrder: "asc" },
        include: { images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true } } },
      }),
      prisma.loungeImage.findMany({ where: { venueId: null }, orderBy: { sortOrder: "asc" }, select: { id: true, url: true } }),
    ]);
    if (!settings) return null;
    return { ...settings, venues, gallery };
  },
  ["lounge"],
  { tags: ["lounge"], revalidate: 60 }
);

/** null — no DB / not set up: the lounge is treated as switched off. */
export async function getLounge(): Promise<LoungeView | null> {
  if (!hasDatabase) return null;
  try {
    return await readLounge();
  } catch (err) {
    console.error("[lounge] DB read failed:", err);
    return null;
  }
}
