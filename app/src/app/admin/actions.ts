"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { clearAdminSession, createAdminSession, requireAdmin, verifyAdminPassword } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";
import { isRichTextEmpty, sanitizeRichText } from "@/lib/rich-text";
import { SLUG_RE } from "@/lib/slug";
import { columnFor, type ColumnKey, type SpecValues } from "@/lib/spec-types";

export async function loginAdmin(formData: FormData): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  const ok = await verifyAdminPassword(password);
  if (!ok) return { error: "Неверный пароль" };
  await createAdminSession();
  redirect("/admin/catalog");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateProductAttributes(
  productId: number,
  fields: { brand?: string; flavor?: string; strength?: string; packaging?: string }
): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;

  await prisma.product.update({
    where: { id: productId },
    data: {
      brand: fields.brand?.trim() || null,
      flavor: fields.flavor?.trim() || null,
      strength: fields.strength?.trim() || null,
      packaging: fields.packaging?.trim() || null,
      needsManualReview: false,
    },
  });
  revalidatePath("/admin/catalog");
  revalidatePath("/catalog");
  // /catalog, / and sitemap.ts read through a 60s cache (see lib/catalog.ts)
  // that revalidatePath alone doesn't touch — bust it so the edit shows up
  // immediately instead of up to a minute later.
  updateTag("catalog");
}

/** Тип товара + значения его характеристик. Поля Бренд/Вкус/Крепость/Вес идут в колонки Product, остальные — в specs. */
export async function saveProductSpecs(
  productId: number,
  specTypeId: number | null,
  values: SpecValues
): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;

  const [type, current] = await Promise.all([
    specTypeId ? prisma.specType.findUnique({ where: { id: specTypeId } }) : null,
    prisma.product.findUnique({ where: { id: productId }, select: { brand: true, flavor: true, strength: true, packaging: true, specTypeId: true } }),
  ]);
  if (!current) return;
  // Бренд/Вкус/Крепость/Вес уже разобраны из Poster — пишем в колонку только
  // если значение реально изменили руками, иначе ничего не трогаем и ночной
  // sync продолжает их обновлять сам.
  const columns: Partial<Record<ColumnKey, string | null>> = {};
  const specs: SpecValues = {};
  for (const label of type?.fields ?? []) {
    const value = (values[label] ?? "").trim();
    const col = columnFor(label);
    if (col) {
      if (value !== (current[col] ?? "")) columns[col] = value || null;
    } else if (value) specs[label] = value;
  }
  const editedColumns = Object.keys(columns).length > 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      specTypeId: type?.id ?? null,
      // Выбор (или сброс) типа руками — автотип по категории его больше не трогает.
      ...((type?.id ?? null) !== current.specTypeId ? { specTypeManual: true } : {}),
      ...columns,
      // Без типа уже введённые значения не теряем — просто не показываем.
      ...(type ? { specs } : {}),
      // Ручная правка колонок: sync-catalog не должен затирать их заново распарсенными.
      ...(editedColumns ? { needsManualReview: false } : {}),
    },
  });
  revalidatePath("/product/[id]", "page");
  updateTag("catalog");
}

function parseFields(text: string): string[] {
  return [...new Set(text.split("\n").map((l) => l.trim()).filter(Boolean))];
}

export async function saveSpecType(formData: FormData): Promise<{ error?: string }> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return { error: "database_not_configured" };

  const id = Number(formData.get("id")) || null;
  const name = String(formData.get("name") ?? "").trim();
  const groupName = String(formData.get("groupName") ?? "").trim();
  const fields = parseFields(String(formData.get("fields") ?? ""));
  if (!name || !groupName || fields.length === 0) return { error: "Нужны название, группа и хотя бы одно поле" };

  try {
    if (id) {
      await prisma.specType.update({ where: { id }, data: { name, groupName, fields } });
    } else {
      const max = await prisma.specType.aggregate({ _max: { position: true } });
      await prisma.specType.create({ data: { name, groupName, fields, position: (max._max.position ?? -1) + 1 } });
    }
  } catch {
    return { error: "Тип с таким названием уже есть" };
  }
  revalidatePath("/admin/spec-types");
  revalidatePath("/admin/specs");
  revalidatePath("/product/[id]", "page");
  return {};
}

export async function deleteSpecType(id: number): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.specType.delete({ where: { id } });
  revalidatePath("/admin/spec-types");
  revalidatePath("/admin/specs");
  revalidatePath("/product/[id]", "page");
}

function revalidateProduct() {
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath("/product/[id]", "page");
  updateTag("catalog");
}

/** Добавляет ручные фото в конец галереи товара; первое фото галереи — главное. */
export async function addProductImages(productId: number, urls: string[]): Promise<{ id: number; url: string }[]> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return [];
  const clean = urls.map((u) => u.trim()).filter(Boolean);
  if (clean.length === 0) return [];

  const max = await prisma.productImage.aggregate({ where: { productId }, _max: { sortOrder: true } });
  let order = (max._max.sortOrder ?? -1) + 1;
  const created = await prisma.$transaction(
    clean.map((url) => prisma.productImage.create({ data: { productId, url, sortOrder: order++ }, select: { id: true, url: true } }))
  );
  revalidateProduct();
  return created;
}

/** ids — все фото товара в новом порядке. */
export async function reorderProductImages(productId: number, ids: number[]): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.$transaction(
    ids.map((id, i) => prisma.productImage.updateMany({ where: { id, productId }, data: { sortOrder: i } }))
  );
  revalidateProduct();
}

export async function deleteProductImage(id: number): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.productImage.deleteMany({ where: { id } });
  revalidateProduct();
}

/** Пустое описание = убрать. HTML чистится белым списком (lib/rich-text.ts). */
export async function saveProductDescription(productId: number, html: string): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  const clean = isRichTextEmpty(html) ? null : sanitizeRichText(html);
  await prisma.product.update({ where: { id: productId }, data: { descriptionManual: clean } });
  revalidateProduct();
}

export async function setProductHidden(productId: number, hidden: boolean): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;

  await prisma.product.update({ where: { id: productId }, data: { hiddenManual: hidden } });
  revalidatePath("/catalog");
  revalidatePath("/product/[id]", "page");
  updateTag("catalog");
}

export async function createHeroSlide(formData: FormData): Promise<{ error?: string }> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return { error: "database_not_configured" };

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  if (!imageUrl || !linkUrl) return { error: "Нужны и картинка, и ссылка" };

  const maxOrder = await prisma.heroSlide.aggregate({ _max: { order: true } });
  await prisma.heroSlide.create({
    data: { imageUrl, linkUrl, order: (maxOrder._max.order ?? -1) + 1 },
  });
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
  return {};
}

export async function toggleHeroSlideActive(id: number, active: boolean): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.heroSlide.update({ where: { id }, data: { active } });
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
}

export async function deleteHeroSlide(id: number): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
}

export async function saveHeroTile(formData: FormData): Promise<{ error?: string }> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return { error: "database_not_configured" };

  const slot = Number(formData.get("slot"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  if (![0, 1, 2, 3].includes(slot)) return { error: "Неверный слот" };
  if (!imageUrl || !linkUrl) return { error: "Нужны и картинка, и ссылка" };

  await prisma.heroTile.upsert({
    where: { slot },
    create: { slot, imageUrl, linkUrl },
    update: { imageUrl, linkUrl },
  });
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
  return {};
}

/** Back to the slot's default category photo + link. */
export async function resetHeroTile(slot: number): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.heroTile.deleteMany({ where: { slot } });
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
}

function revalidateLounge() {
  revalidatePath("/lounge");
  revalidatePath("/admin/lounge");
  revalidatePath("/");
  updateTag("lounge");
}

export async function saveLoungeSettings(data: {
  enabled: boolean;
  title: string;
  subtitle: string;
  bodyHtml: string;
  heroImageUrl: string;
  whatsappNumber: string;
}): Promise<{ error?: string }> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return { error: "database_not_configured" };
  const title = data.title.trim();
  if (!title) return { error: "Нужен заголовок" };

  const fields = {
    enabled: data.enabled,
    title,
    subtitle: data.subtitle.trim(),
    bodyHtml: isRichTextEmpty(data.bodyHtml) ? "" : sanitizeRichText(data.bodyHtml),
    heroImageUrl: data.heroImageUrl.trim() || null,
    // только цифры (wa.me/<номер>); пусто — берётся номер из настроек сайта
    whatsappNumber: data.whatsappNumber.replace(/\D/g, "") || null,
  };
  await prisma.loungeSettings.upsert({ where: { id: 1 }, create: { id: 1, ...fields }, update: fields });
  revalidateLounge();
  return {};
}

export async function saveLoungeVenue(formData: FormData): Promise<{ error?: string }> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return { error: "database_not_configured" };

  const id = Number(formData.get("id")) || null;
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const hours = String(formData.get("hours") ?? "").trim();
  const mapUrl = String(formData.get("mapUrl") ?? "").trim();
  if (!name || !address || !hours) return { error: "Нужны название, адрес и часы работы" };
  if (mapUrl && !/^https?:\/\//i.test(mapUrl)) return { error: "Ссылка на 2ГИС должна начинаться с https://" };

  if (id) {
    await prisma.loungeVenue.update({ where: { id }, data: { name, address, hours, mapUrl } });
  } else {
    const max = await prisma.loungeVenue.aggregate({ _max: { sortOrder: true } });
    await prisma.loungeVenue.create({ data: { name, address, hours, mapUrl, sortOrder: (max._max.sortOrder ?? -1) + 1 } });
  }
  revalidateLounge();
  return {};
}

export async function deleteLoungeVenue(id: number): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.loungeVenue.delete({ where: { id } });
  revalidateLounge();
}

/** venueId = null — общая галерея «Атмосфера». */
export async function addLoungeImages(venueId: number | null, urls: string[]): Promise<{ id: number; url: string }[]> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return [];
  const clean = urls.map((u) => u.trim()).filter(Boolean);
  if (clean.length === 0) return [];

  const max = await prisma.loungeImage.aggregate({ where: { venueId }, _max: { sortOrder: true } });
  let order = (max._max.sortOrder ?? -1) + 1;
  const created = await prisma.$transaction(
    clean.map((url) => prisma.loungeImage.create({ data: { venueId, url, sortOrder: order++ }, select: { id: true, url: true } }))
  );
  revalidateLounge();
  return created;
}

export async function reorderLoungeImages(ids: number[]): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.$transaction(ids.map((id, i) => prisma.loungeImage.update({ where: { id }, data: { sortOrder: i } })));
  revalidateLounge();
}

export async function deleteLoungeImage(id: number): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.loungeImage.deleteMany({ where: { id } });
  revalidateLounge();
}

function revalidateBlog(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/admin/articles");
  updateTag("blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export interface ArticleInput {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
}

/** Создаёт или обновляет статью. publishedAt ставится при первой публикации и дальше не двигается. */
export async function saveArticle(input: ArticleInput): Promise<{ id?: number; slug?: string; error?: string }> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return { error: "database_not_configured" };

  const title = input.title.trim();
  const slug = input.slug.trim();
  if (!title) return { error: "Нужен заголовок" };
  if (!SLUG_RE.test(slug)) return { error: "Адрес (slug) — только латиница, цифры и дефисы, например kak-vybrat-kalyan" };

  const data = {
    title,
    slug,
    excerpt: input.excerpt.trim(),
    content: isRichTextEmpty(input.content) ? "" : sanitizeRichText(input.content),
    coverImage: input.coverImage.trim() || null,
    seoTitle: input.seoTitle.trim() || null,
    seoDescription: input.seoDescription.trim() || null,
    published: input.published,
  };

  try {
    if (input.id) {
      const existing = await prisma.article.findUnique({ where: { id: input.id }, select: { publishedAt: true } });
      const publishedAt = data.published ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null;
      await prisma.article.update({ where: { id: input.id }, data: { ...data, publishedAt } });
      revalidateBlog(slug);
      return { id: input.id, slug };
    }
    const created = await prisma.article.create({
      data: { ...data, publishedAt: data.published ? new Date() : null },
      select: { id: true },
    });
    revalidateBlog(slug);
    return { id: created.id, slug };
  } catch {
    // slug is the only unique column
    return { error: "Статья с таким адресом (slug) уже есть" };
  }
}

export async function deleteArticle(id: number): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.article.delete({ where: { id } });
  revalidateBlog();
  redirect("/admin/articles");
}
