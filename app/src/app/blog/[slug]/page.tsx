import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCardView } from "@/components/blog/ArticleCardView";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { UploadedImage } from "@/components/ui/UploadedImage";
import { requireAdmin } from "@/lib/admin-auth";
import { formatArticleDate, getArticleBySlug, getOtherArticles } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://contrast.example.kz";

// A draft is a 404 for everyone except a signed-in admin (that is the preview).
async function loadVisible(slug: string) {
  const article = await getArticleBySlug(slug);
  if (!article) return null;
  if (!article.published && !(await requireAdmin())) return null;
  return article;
}

const absolute = (url: string) => new URL(url, SITE_URL).toString();

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadVisible(slug);
  if (!article) return { title: "Статья не найдена" };
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${article.slug}` },
    // drafts (admin preview only) must never be indexed
    robots: article.published ? undefined : { index: false, follow: false },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${article.slug}`,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: article.coverImage ? [absolute(article.coverImage)] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = await loadVisible(slug);
  if (!article) notFound();

  const others = await getOtherArticles(article.id);
  const date = article.publishedAt ?? article.createdAt;
  const url = `${SITE_URL}/blog/${article.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || undefined,
      image: article.coverImage ? absolute(article.coverImage) : undefined,
      datePublished: date.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "Contrast" },
      publisher: { "@type": "Organization", name: "Contrast" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Статьи", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];

  return (
    <Container className="py-8 lg:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {!article.published && (
        <p className="mb-6 rounded-sm border border-border bg-surface-sunken px-4 py-3 font-body text-sm text-foreground-secondary">
          Черновик — виден только вам. На сайте появится после публикации.
        </p>
      )}

      <nav aria-label="Хлебные крошки" className="font-body text-sm text-foreground-secondary">
        <Link href="/" className="hover:text-foreground">
          Главная
        </Link>
        <span className="mx-2 text-foreground-muted">/</span>
        <Link href="/blog" className="hover:text-foreground">
          Статьи
        </Link>
      </nav>

      <article className="mx-auto mt-6 max-w-3xl">
        <h1 className="font-display text-3xl leading-tight text-foreground lg:text-4xl">{article.title}</h1>
        <time dateTime={date.toISOString()} className="mt-3 block font-body text-sm text-foreground-muted">
          {formatArticleDate(date)}
        </time>
        {article.coverImage && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-md bg-surface-sunken">
            <UploadedImage src={article.coverImage} alt={article.title} sizes="(min-width: 768px) 768px, 100vw" priority className="object-cover" />
          </div>
        )}
        <RichText html={article.content} className="mt-8" />
      </article>

      {others.length > 0 && (
        <section className="mt-16 lg:mt-24">
          <h2 className="mb-5 font-display text-2xl text-foreground">Другие статьи</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((a) => (
              <ArticleCardView key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
