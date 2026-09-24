import type { Metadata } from "next";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AgeGate } from "@/components/layout/AgeGate";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CartProvider } from "@/lib/cart-context";
import { BRANCHES, INSTAGRAM_URL } from "@/lib/branches";
import { getCustomerSession } from "@/lib/customer-auth";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://contrast.example.kz";
const TITLE = "Кальянный магазин в Астане — кальяны, табак, аксессуары | Contrast";
const DESCRIPTION =
  "Hookah Market Contrast в Астане: кальяны, табак для кальяна, бестабачные смеси, уголь и аксессуары. Самовывоз с ул. Уалиханова, 1 и доставка по городу.";

// Local-business markup so Google/Яндекс tie the site to the real shop on the map.
const STORE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Contrast Hookah Market",
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. Шокана Уалиханова, 1 (2 этаж)",
    addressLocality: "Астана",
    addressCountry: "KZ",
  },
  openingHours: "Mo-Su 11:00-23:00",
  sameAs: [INSTAGRAM_URL, BRANCHES.centre.mapUrl],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | Contrast" },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Contrast",
    locale: "ru_RU",
    type: "website",
  },
  alternates: { canonical: "/" },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getCustomerSession();

  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STORE_JSON_LD) }}
        />
        <AgeGate />
        <CartProvider>
          <Header isLoggedIn={Boolean(session)} />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
