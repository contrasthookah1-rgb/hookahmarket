import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { requireAdmin } from "@/lib/admin-auth";
import { formatArticleDate } from "@/lib/blog";
import { hasDatabase, prisma } from "@/lib/db";

const LIMIT = 200;

export default async function AdminArticlesPage({ searchParams }: PageProps<"/admin/articles">) {
  if (!(await requireAdmin())) redirect("/admin/login");

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const articles = hasDatabase
    ? await prisma.article.findMany({
        where: q ? { title: { contains: q, mode: "insensitive" } } : {},
        orderBy: [{ published: "asc" }, { updatedAt: "desc" }],
        take: LIMIT,
        select: { id: true, title: true, slug: true, published: true, publishedAt: true, updatedAt: true },
      })
    : [];

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Статьи</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Фото и описание
          </Link>
          <Link href="/admin/lounge" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Лаунж
          </Link>
          <Link href="/admin/orders" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Заказы
          </Link>
          <form action={logoutAdmin}>
            <Button variant="ghost" size="sm" type="submit">
              Выйти
            </Button>
          </form>
        </div>
      </div>

      {!hasDatabase ? (
        <p className="font-body text-foreground-muted">DATABASE_URL не настроен — админка недоступна в этом окружении.</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <form action="/admin/articles" className="flex items-end gap-3">
              <div className="w-72">
                <Input name="q" label="Поиск по заголовку" defaultValue={q} />
              </div>
              <Button type="submit" variant="secondary" size="md">
                Найти
              </Button>
            </form>
            <Link href="/admin/articles/new" className="ml-auto">
              <Button type="button" size="md">
                Новая статья
              </Button>
            </Link>
          </div>

          {articles.length === 0 ? (
            <p className="font-body text-foreground-muted">{q ? "Ничего не найдено." : "Статей пока нет. Нажмите «Новая статья»."}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
              {articles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors duration-150 ease-standard hover:bg-surface-sunken"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-body text-sm text-foreground">{a.title}</span>
                      <span className="block font-body text-xs text-foreground-muted">/blog/{a.slug}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-body text-xs text-foreground-muted">
                        {a.published && a.publishedAt ? formatArticleDate(a.publishedAt) : `изменена ${formatArticleDate(a.updatedAt)}`}
                      </span>
                      <Badge tone={a.published ? "success" : "neutral"}>{a.published ? "Опубликована" : "Черновик"}</Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Container>
  );
}
