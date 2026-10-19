"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteArticle, saveArticle } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { slugify } from "@/lib/slug";

interface ArticleValues {
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

const EMPTY: ArticleValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  seoTitle: "",
  seoDescription: "",
  published: false,
};

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={`font-body text-xs ${value.length > max ? "text-danger" : "text-foreground-muted"}`}>
      {value.length} / {max} — {value.length > max ? "длиннее — поисковик обрежет" : "рекомендуемая длина"}
    </span>
  );
}

export function ArticleForm({ initial }: { initial?: ArticleValues }) {
  const router = useRouter();
  const [v, setV] = useState<ArticleValues>(initial ?? EMPTY);
  // the slug follows the title until it's been edited by hand (or the article already exists)
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof ArticleValues>(key: K, value: ArticleValues[K]) => {
    setStatus("idle");
    setV((cur) => ({ ...cur, [key]: value }));
  };

  const save = async () => {
    setStatus("saving");
    setError(null);
    const res = await saveArticle(v);
    if (res.error) {
      setError(res.error);
      setStatus("idle");
      return;
    }
    setStatus("saved");
    if (!v.id && res.id) router.replace(`/admin/articles/${res.id}`);
    else router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Заголовок"
        value={v.title}
        onChange={(e) => {
          set("title", e.target.value);
          if (!slugTouched) set("slug", slugify(e.target.value));
        }}
      />
      <Input
        label="Адрес статьи (латиница) — ссылка будет /blog/этот-адрес"
        value={v.slug}
        onChange={(e) => {
          setSlugTouched(true);
          set("slug", e.target.value);
        }}
      />
      <label className="flex flex-col gap-1.5 font-body">
        <span className="text-xs tracking-wide text-foreground-secondary">Краткое описание (в списке статей)</span>
        <textarea
          value={v.excerpt}
          rows={3}
          onChange={(e) => set("excerpt", e.target.value)}
          className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-base text-foreground outline-none focus:border-focus-ring"
        />
      </label>
      <div>
        <div className="mb-1.5 font-body text-xs tracking-wide text-foreground-secondary">Обложка</div>
        <ImageUploadField value={v.coverImage} onChange={(url) => set("coverImage", url)} />
      </div>
      <div>
        <div className="mb-1.5 font-body text-xs tracking-wide text-foreground-secondary">Текст</div>
        <RichTextEditor value={v.content} onChange={(html) => set("content", html)} />
      </div>

      <fieldset className="flex flex-col gap-3 rounded-md border border-border p-4">
        <legend className="px-1 font-body text-sm text-foreground">Для поисковиков</legend>
        <Input label="SEO-заголовок (пусто — как заголовок)" value={v.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
        <Counter value={v.seoTitle || v.title} max={60} />
        <label className="flex flex-col gap-1.5 font-body">
          <span className="text-xs tracking-wide text-foreground-secondary">SEO-описание (пусто — краткое описание)</span>
          <textarea
            value={v.seoDescription}
            rows={2}
            onChange={(e) => set("seoDescription", e.target.value)}
            className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-base text-foreground outline-none focus:border-focus-ring"
          />
        </label>
        <Counter value={v.seoDescription || v.excerpt} max={160} />
      </fieldset>

      <Checkbox label="Опубликовано (без галочки статья — черновик, на сайте её не видно)" checked={v.published} onChange={(e) => set("published", e.target.checked)} />

      {error && <p className="font-body text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} loading={status === "saving"} disabled={status === "saving"}>
          {status === "saved" ? "Сохранено" : "Сохранить"}
        </Button>
        {v.id && (
          <Link
            href={`/blog/${v.slug}`}
            target="_blank"
            className="font-body text-sm text-foreground-secondary underline-offset-4 hover:text-foreground hover:underline"
          >
            {v.published ? "Открыть на сайте" : "Предпросмотр черновика"}
          </Link>
        )}
        {v.id &&
          (confirmDelete ? (
            <span className="ml-auto flex items-center gap-2 font-body text-sm text-foreground">
              Удалить статью насовсем?
              <Button size="sm" onClick={() => deleteArticle(v.id!)}>
                Да, удалить
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                Отмена
              </Button>
            </span>
          ) : (
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setConfirmDelete(true)}>
              Удалить
            </Button>
          ))}
      </div>
    </div>
  );
}
