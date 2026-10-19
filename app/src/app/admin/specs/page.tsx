import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";
import { SpecProductRow } from "@/components/admin/SpecProductRow";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { requireAdmin } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";
import type { SpecValues } from "@/lib/spec-types";

const PAGE_SIZE = 30;

export default async function AdminSpecsPage({ searchParams }: PageProps<"/admin/specs">) {
  if (!(await requireAdmin())) redirect("/admin/login");

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const category = typeof params.category === "string" ? params.category : "";
  const untypedOnly = params.untyped === "1";
  const page = Math.max(1, Number(params.page) || 1);

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(category ? { categoryLabel: category } : {}),
    ...(untypedOnly ? { specTypeId: null } : {}),
  };

  const [products, total, types, categories] = hasDatabase
    ? await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { id: "asc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: {
            id: true,
            name: true,
            categoryLabel: true,
            specTypeId: true,
            specs: true,
            brand: true,
            flavor: true,
            strength: true,
            packaging: true,
          },
        }),
        prisma.product.count({ where }),
        prisma.specType.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true, fields: true } }),
        prisma.category.findMany({ orderBy: { label: "asc" }, select: { label: true } }),
      ])
    : [[], 0, [], []];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (overrides: Record<string, string>) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (category) next.set("category", category);
    if (untypedOnly) next.set("untyped", "1");
    for (const [k, v] of Object.entries(overrides)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    return `/admin/specs?${next.toString()}`;
  };

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Характеристики товаров</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/spec-types" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Типы и поля
          </Link>
          <Link href="/admin/products" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Фото товаров
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
        <p className="font-body text-foreground-muted">
          DATABASE_URL не настроен — админка недоступна в этом окружении.
        </p>
      ) : (
        <>
          <form action="/admin/specs" className="mb-4 flex flex-wrap items-end gap-3">
            <div className="w-full max-w-sm">
              <Input name="q" label="Поиск по названию" defaultValue={q} placeholder="Например: Black Burn" />
            </div>
            <div className="w-64">
              <Select
                name="category"
                label="Категория"
                defaultValue={category}
                options={[{ value: "", label: "Все категории" }, ...categories.map((c) => ({ value: c.label, label: c.label }))]}
              />
            </div>
            {untypedOnly && <input type="hidden" name="untyped" value="1" />}
            <Button type="submit" variant="secondary" size="md">
              Найти
            </Button>
            <Link href={buildHref({ untyped: untypedOnly ? "" : "1", page: "" })}>
              <Button type="button" variant={untypedOnly ? "primary" : "ghost"} size="md">
                {untypedOnly ? "Показаны только без типа" : "Показать только без типа"}
              </Button>
            </Link>
          </form>

          <p className="mb-4 font-body text-sm text-foreground-muted">
            Найдено товаров: {total}. Страница {page} из {totalPages}. Выберите тип — появятся его поля;
            Бренд, Вкус, Крепость и Вес сохраняются так же, как в «Доразметке».
          </p>

          {products.length === 0 ? (
            <p className="font-body text-foreground-muted">Ничего не найдено.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {products.map((p) => (
                <SpecProductRow
                  // type in the key: re-fetched rows after a save keep their typed state otherwise
                  key={`${p.id}-${p.specTypeId}`}
                  productId={p.id}
                  name={p.name}
                  categoryLabel={p.categoryLabel}
                  specTypeId={p.specTypeId}
                  columns={{ brand: p.brand, flavor: p.flavor, strength: p.strength, packaging: p.packaging }}
                  specs={(p.specs ?? {}) as SpecValues}
                  types={types}
                />
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center gap-2">
              {page > 1 && (
                <Link href={buildHref({ page: String(page - 1) })}>
                  <Button type="button" variant="ghost" size="sm">
                    ← Назад
                  </Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={buildHref({ page: String(page + 1) })}>
                  <Button type="button" variant="ghost" size="sm">
                    Вперёд →
                  </Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </Container>
  );
}
