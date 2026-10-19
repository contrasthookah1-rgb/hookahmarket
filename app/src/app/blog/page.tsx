import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCardView } from "@/components/blog/ArticleCardView";
import { Container } from "@/components/ui/Container";
import { BLOG_PAGE_SIZE, getPublishedArticles } from "@/lib/blog";

const pageNumber = (raw: string | string[] | undefined) => Math.max(1, Number(typeof raw === "string" ? raw : 1) || 1);

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  return {
    title: page > 1 ? `Статьи — страница ${page}` : "Статьи",
    description: "Статьи Contrast: как выбрать кальян, табак и угли, советы по уходу и новости магазина в Астане.",
    alternates: { canonical: page > 1 ? `/blog?page=${page}` : "/blog" },
  };
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const page = pageNumber((await searchParams).page);
  const { articles, total } = await getPublishedArticles(page);
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  if (page > totalPages || (total === 0 && page > 1)) notFound();

  const href = (p: number) => (p === 1 ? "/blog" : `/blog?page=${p}`);

  return (
    <Container className="py-10 lg:py-14">
      <h1 className="font-display text-3xl text-foreground lg:text-4xl">Статьи</h1>

      {articles.length === 0 ? (
        <p className="mt-6 font-body text-foreground-muted">Скоро здесь появятся статьи.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCardView key={a.id} article={a} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Страницы" className="mt-10 flex flex-wrap items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={href(p)}
              aria-current={p === page ? "page" : undefined}
              className={`flex size-10 items-center justify-center rounded-sm border font-body text-sm transition-colors duration-150 ease-standard ${
                p === page ? "border-foreground bg-foreground text-surface" : "border-border text-foreground hover:bg-surface-sunken"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </Container>
  );
}
