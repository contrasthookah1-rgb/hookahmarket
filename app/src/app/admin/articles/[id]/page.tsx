import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { Container } from "@/components/ui/Container";
import { requireAdmin } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";

export default async function EditArticlePage({ params }: PageProps<"/admin/articles/[id]">) {
  if (!(await requireAdmin())) redirect("/admin/login");

  const { id } = await params;
  const article = hasDatabase && Number(id) ? await prisma.article.findUnique({ where: { id: Number(id) } }) : null;
  if (!article) notFound();

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Редактирование статьи</h1>
        <Link href="/admin/articles" className="font-body text-sm text-foreground-secondary hover:text-foreground">
          ← Все статьи
        </Link>
      </div>
      <ArticleForm
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          coverImage: article.coverImage ?? "",
          seoTitle: article.seoTitle ?? "",
          seoDescription: article.seoDescription ?? "",
          published: article.published,
        }}
      />
    </Container>
  );
}
