import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { Container } from "@/components/ui/Container";
import { getProductById, getRelatedProducts } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: PageProps<"/product/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) return { title: "Товар не найден" };
  return {
    title: `${product.name} — купить в Астане`,
    description: `${product.name}${product.brand ? `, ${product.brand}` : ""} — ${product.price}. ${product.category} в Hookah Market Contrast, Астана. Самовывоз и доставка.`,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: product.imageUrl ? { images: [product.imageUrl] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[id]">) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imageUrl,
    category: product.category,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      price: product.price.replace(/\D/g, ""),
      priceCurrency: "KZT",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
    },
  };

  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailClient product={product} related={related} />
    </Container>
  );
}
