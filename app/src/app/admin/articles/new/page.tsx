import Link from "next/link";
import { redirect } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { Container } from "@/components/ui/Container";
import { requireAdmin } from "@/lib/admin-auth";

export default async function NewArticlePage() {
  if (!(await requireAdmin())) redirect("/admin/login");

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Новая статья</h1>
        <Link href="/admin/articles" className="font-body text-sm text-foreground-secondary hover:text-foreground">
          ← Все статьи
        </Link>
      </div>
      <ArticleForm />
    </Container>
  );
}
