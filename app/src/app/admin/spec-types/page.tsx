import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";
import { SpecTypeForm } from "@/components/admin/SpecTypeForm";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { requireAdmin } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";

export default async function AdminSpecTypesPage() {
  if (!(await requireAdmin())) redirect("/admin/login");

  const types = hasDatabase ? await prisma.specType.findMany({ orderBy: { position: "asc" } }) : [];

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Типы товаров и их поля</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/specs" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Характеристики товаров
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
          <p className="mb-4 max-w-2xl font-body text-sm text-foreground-muted">
            Здесь можно добавлять и менять типы и их поля. Если переименовать поле, значения, уже введённые
            у товаров под старым названием, перестанут показываться — лучше добавлять новые поля, а не переименовывать.
            Поля «Бренд», «Вкус», «Крепость», «Вес упаковки» и «Вес» связаны с фильтрами каталога — их названия лучше не менять.
          </p>
          <div className="flex flex-col gap-4">
            {types.map((t) => (
              <SpecTypeForm key={`${t.id}-${t.fields.join("|")}`} id={t.id} name={t.name} groupName={t.groupName} fields={t.fields} />
            ))}
          </div>
          <h2 className="mt-8 mb-3 font-display text-xl text-foreground">Добавить тип</h2>
          <SpecTypeForm />
        </>
      )}
    </Container>
  );
}
