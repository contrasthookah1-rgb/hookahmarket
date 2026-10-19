"use client";

import { useState } from "react";
import {
  addProductImages,
  deleteProductImage,
  reorderProductImages,
  saveProductDescription,
  setProductHidden,
} from "@/app/admin/actions";
import { PhotoManager, type Img } from "@/components/admin/PhotoManager";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

// Карточка редактирования товара: ручные фото (первое = главное, порядок —
// перетаскиванием или стрелками), описание, «Скрыть с сайта». Фото и порядок
// сохраняются сразу; описание — кнопкой.
export function ProductEditRow({
  productId,
  categoryLabel,
  name,
  imageUrl,
  images,
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
  const [showDesc, setShowDesc] = useState(false);
  const [desc, setDesc] = useState(descriptionManual ?? "");
  const [savingDesc, setSavingDesc] = useState(false);
  const [savedDesc, setSavedDesc] = useState(false);

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

      <PhotoManager
        images={images}
        add={(urls) => addProductImages(productId, urls)}
        reorder={(ids) => reorderProductImages(productId, ids)}
        remove={deleteProductImage}
        empty={
          <div className="flex items-center gap-3">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- admin-managed URL
              <img src={imageUrl} alt="" className="size-24 rounded-sm border border-border object-cover opacity-70" />
            )}
            <span className="max-w-xs font-body text-xs text-foreground-muted">
              {imageUrl ? "Сейчас показывается фото из Poster. Загрузите свои — они встанут первыми." : "Фото нет. Загрузите первое — оно станет главным."}
            </span>
          </div>
        }
      />

      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="ghost" onClick={() => setShowDesc((v) => !v)}>
          {showDesc ? "Свернуть описание" : desc ? "Описание ✓" : "Описание"}
        </Button>
      </div>

      {showDesc && (
        <div className="mt-2">
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
