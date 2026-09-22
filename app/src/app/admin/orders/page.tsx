import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { requireAdmin } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/format";
import { hasDatabase, prisma } from "@/lib/db";

const PAGE_SIZE = 200;

const BRANCH_LABEL: Record<string, string> = {
  centre: "Уалиханова 1",
  left: "Мухамедханова 4В",
  alfarabi: "Аль-Фараби 9/2",
};

interface OrderItem {
  name: string;
  quantity: number;
}

export default async function AdminOrdersPage() {
  if (!(await requireAdmin())) redirect("/admin/login");

  const [orders, total] = hasDatabase
    ? await Promise.all([
        prisma.order.findMany({ orderBy: { id: "desc" }, take: PAGE_SIZE }),
        prisma.order.count(),
      ])
    : [[], 0];

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Заказы</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/catalog" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Каталог
          </Link>
          <Link href="/admin/products" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Фото товаров
          </Link>
          <Link href="/admin/hero-slides" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Слайды на главной
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
          DATABASE_URL не настроен — заказы недоступны в этом окружении.
        </p>
      ) : orders.length === 0 ? (
        <p className="font-body text-foreground-muted">Заказов пока нет.</p>
      ) : (
        <>
          <p className="mb-4 font-body text-sm text-foreground-muted">
            Всего заказов: {total}
            {total > PAGE_SIZE && ` (показаны последние ${PAGE_SIZE})`}.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-xs tracking-wide text-foreground-secondary uppercase">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Дата</th>
                  <th className="py-2 pr-4">Филиал</th>
                  <th className="py-2 pr-4">Клиент</th>
                  <th className="py-2 pr-4">Товары</th>
                  <th className="py-2 pr-4">Сумма</th>
                  <th className="py-2">Poster</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const items = o.items as unknown as OrderItem[];
                  return (
                    <tr key={o.id} className="border-b border-border font-body text-sm text-foreground">
                      <td className="py-2 pr-4">{o.id}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {o.createdAt.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="py-2 pr-4">{BRANCH_LABEL[o.branch] ?? o.branch}</td>
                      <td className="py-2 pr-4">
                        {o.customerName}
                        <div className="text-xs text-foreground-muted">{o.customerPhone}</div>
                      </td>
                      <td className="py-2 pr-4">
                        {items.map((it) => `${it.name} × ${it.quantity}`).join(", ")}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">{formatPrice(o.totalTenge)}</td>
                      <td className="py-2">
                        {o.posterOrderId ? (
                          <Badge tone="success">#{o.posterOrderId}</Badge>
                        ) : (
                          <Badge tone="danger">не дошёл</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Container>
  );
}
