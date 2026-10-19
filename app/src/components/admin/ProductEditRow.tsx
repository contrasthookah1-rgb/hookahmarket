"use client";

import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  addProductImages,
  deleteProductImage,
  reorderProductImages,
  saveProductDescription,
  setProductHidden,
} from "@/app/admin/actions";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

interface Img {
  id: number;
  url: string;
}

// Карточка редактирования товара: ручные фото (первое = главное, порядок —
// перетаскиванием или стрелками), описание, «Скрыть с сайта». Фото и порядок
// сохраняются сразу; описание — кнопкой.
export function ProductEditRow({
  productId,
  categoryLabel,
  name,
  imageUrl,
  images: initialImages,
  descriptionManual,
  hiddenManual,
}: {
  productId: number;
  categoryLabel: string;
  name: string;
  imageUrl: string | null;
  images: Img[];
  descriptionManual: string | null;
  hiddenManual: boolean;
}) {
  const [hidden, setHidden] = useState(hiddenManual);
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkValue, setLinkValue] = useState("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [showDesc, setShowDesc] = useState(false);
  const [desc, setDesc] = useState(descriptionManual ?? "");
  const [savingDesc, setSavingDesc] = useState(false);
  const [savedDesc, setSavedDesc] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reorder = (next: Img[]) => {
    setImages(next);
    void reorderProductImages(productId, next.map((i) => i.id));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    next.splice(to, 0, next.splice(from, 1)[0]);
    reorder(next);
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const body = new FormData();
        body.set("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        if (!res.ok) throw new Error();
        urls.push(((await res.json()) as { url: string }).url);
      }
      const created = await addProductImages(productId, urls);
      setImages((cur) => [...cur, ...created]);
    } catch {
      setError("Не удалось загрузить файл");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addLink = async () => {
    const created = await addProductImages(productId, [linkValue]);
    setImages((cur) => [...cur, ...created]);
    setLinkValue("");
  };

  const remove = async (img: Img) => {
    if (!confirm("Удалить это фото?")) return;
    setImages((cur) => cur.filter((i) => i.id !== img.id));
    await deleteProductImage(img.id);
  };

  const saveDesc = async () => {
    setSavingDesc(true);
    await saveProductDescription(productId, desc);
    setSavingDesc(false);
    setSavedDesc(true);
  };

  return (
    <li className="rounded-md border border-border p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-body text-sm text-foreground">{name}</div>
          <div className="font-body text-xs text-foreground-muted">{categoryLabel}</div>
        </div>
        <Checkbox
          label="Скрыть с сайта"
          checked={hidden}
          onChange={async (e) => {
            const next = e.target.checked;
            setHidden(next);
            await setProductHidden(productId, next);
          }}
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => setDragId(img.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              const from = images.findIndex((x) => x.id === dragId);
              if (from >= 0 && from !== i) move(from, i);
              setDragId(null);
            }}
            className={`flex w-24 cursor-grab flex-col gap-1 ${dragId === img.id ? "opacity-40" : ""}`}
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-managed URL, same convention as other image fields */}
              <img src={img.url} alt="" draggable={false} className="size-24 rounded-sm border border-border object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 rounded-full bg-surface px-1.5 py-0.5 font-body text-[10px] text-foreground">
                  Главное
                </span>
              )}
              <button
                type="button"
                aria-label="Удалить фото"
                onClick={() => remove(img)}
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-surface text-foreground hover:text-danger"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex justify-between">
              <button type="button" aria-label="Сдвинуть влево" disabled={i === 0} onClick={() => move(i, i - 1)} className="flex size-8 items-center justify-center rounded-sm border border-border text-foreground disabled:opacity-30">
                <ArrowLeft className="size-4" aria-hidden="true" />
              </button>
              <button type="button" aria-label="Сдвинуть вправо" disabled={i === images.length - 1} onClick={() => move(i, i + 1)} className="flex size-8 items-center justify-center rounded-sm border border-border text-foreground disabled:opacity-30">
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <div className="flex items-center gap-3">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- admin-managed URL
              <img src={imageUrl} alt="" className="size-24 rounded-sm border border-border object-cover opacity-70" />
            )}
            <span className="max-w-xs font-body text-xs text-foreground-muted">
              {imageUrl ? "Сейчас показывается фото из Poster. Загрузите свои — они встанут первыми." : "Фото нет. Загрузите первое — оно станет главным."}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={uploading}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) void uploadFiles(files);
          }}
          className="font-body text-xs text-foreground-secondary file:mr-3 file:rounded-sm file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:font-body file:text-xs file:text-foreground"
        />
        <div className="w-full max-w-xs">
          <Input value={linkValue} onChange={(e) => setLinkValue(e.target.value)} placeholder="или ссылка на картинку" className="text-xs" />
        </div>
        {linkValue.trim() && (
          <Button size="sm" variant="secondary" onClick={addLink}>
            Добавить по ссылке
          </Button>
        )}
        {uploading && <span className="font-body text-xs text-foreground-muted">Загрузка…</span>}
        {error && <span className="font-body text-xs text-danger">{error}</span>}
        <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setShowDesc((v) => !v)}>
          {showDesc ? "Свернуть описание" : desc ? "Описание ✓" : "Описание"}
        </Button>
      </div>

      {showDesc && (
        <div className="mt-4">
          <RichTextEditor
            value={desc}
            onChange={(html) => {
              setSavedDesc(false);
              setDesc(html);
            }}
          />
          <div className="mt-3">
            <Button size="sm" onClick={saveDesc} loading={savingDesc} disabled={savingDesc}>
              {savedDesc ? "Сохранено" : "Сохранить описание"}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
