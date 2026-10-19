import Link from "next/link";
import { redirect } from "next/navigation";
import { addLoungeImages, deleteLoungeImage, logoutAdmin, reorderLoungeImages } from "@/app/admin/actions";
import { LoungeSettingsForm } from "@/components/admin/LoungeSettingsForm";
import { LoungeVenueForm } from "@/components/admin/LoungeVenueForm";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { requireAdmin } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";

export default async function AdminLoungePage() {
  if (!(await requireAdmin())) redirect("/admin/login");

  // read straight from the DB (not the cached public reader) so edits show immediately
  const [settings, venues, gallery] = hasDatabase
    ? await Promise.all([
        prisma.loungeSettings.findUnique({ where: { id: 1 } }),
        prisma.loungeVenue.findMany({
          orderBy: { sortOrder: "asc" },
          include: { images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true } } },
        }),
        prisma.loungeImage.findMany({ where: { venueId: null }, orderBy: { sortOrder: "asc" }, select: { id: true, url: true } }),
      ])
    : [null, [], []];

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Лаунж</h1>
        <div className="flex items-center gap-4">
          <Link href="/lounge" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Открыть страницу
          </Link>
          <Link href="/admin/products" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Фото и описание
          </Link>
          <Link href="/admin/specs" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Характеристики
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
      ) : !settings ? (
        <p className="font-body text-foreground-muted">Настройки лаунжа ещё не созданы (миграция не применена).</p>
      ) : (
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-3 font-display text-xl text-foreground">Страница</h2>
            <LoungeSettingsForm initial={settings} />
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl text-foreground">Точки</h2>
            <div className="flex flex-col gap-4">
              {venues.map((v) => (
                <LoungeVenueForm
                  key={`${v.id}-${v.name}-${v.address}-${v.hours}-${v.mapUrl}`}
                  id={v.id}
                  name={v.name}
                  address={v.address}
                  hours={v.hours}
                  mapUrl={v.mapUrl}
                  images={v.images}
                />
              ))}
            </div>
            <h3 className="mt-6 mb-3 font-display text-lg text-foreground">Добавить точку</h3>
            <LoungeVenueForm />
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl text-foreground">Галерея «Атмосфера»</h2>
            <div className="rounded-md border border-border p-4">
              <PhotoManager
                images={gallery}
                mainLabel={false}
                add={addLoungeImages.bind(null, null)}
                reorder={reorderLoungeImages}
                remove={deleteLoungeImage}
              />
            </div>
          </section>
        </div>
      )}
    </Container>
  );
}
