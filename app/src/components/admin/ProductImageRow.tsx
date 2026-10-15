"use client";

import { useState } from "react";
import { resetProductImageToPoster, setProductHidden, setProductImage } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

export function ProductImageRow({
  productId,
  categoryLabel,
  name,
  imageUrl,
  imageSource,
  hiddenManual,
}: {
  productId: number;
  categoryLabel: string;
  name: string;
  imageUrl: string | null;
  imageSource: string | null;
  hiddenManual: boolean;
}) {
  const [hidden, setHidden] = useState(hiddenManual);
  const [value, setValue] = useState(imageUrl ?? "");
  const [source, setSource] = useState(imageSource);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);

  const save = async () => {
    setSaving(true);
    await setProductImage(productId, value);
    setSaving(false);
    setSaved(true);
    setSource("manual");
  };

  const resetToPoster = async () => {
    if (!confirm("Сбросить ручное фото и подставить текущее фото из Poster для этого товара?")) return;
    setResetting(true);
    const result = await resetProductImageToPoster(productId);
    setResetting(false);
    setSaved(false);
    setValue(result.imageUrl ?? "");
    setSource(result.imageUrl ? "poster" : null);
  };

  return (
    <li className="flex items-start justify-between gap-4 rounded-md border border-border p-4">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-body text-sm text-foreground">{name}</span>
          {source === "manual" && (
            <span className="rounded-full bg-surface-sunken px-2 py-0.5 font-body text-xs text-foreground-muted">
              Фото загружено вручную
            </span>
          )}
        </div>
        <div className="mb-3 font-body text-xs text-foreground-muted">{categoryLabel}</div>
        <ImageUploadField
          value={value}
          onChange={(url) => {
            setSaved(false);
            setValue(url);
          }}
        />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Checkbox
          label="Скрыть с сайта"
          checked={hidden}
          onChange={async (e) => {
            const next = e.target.checked;
            setHidden(next);
            await setProductHidden(productId, next);
          }}
        />
        <Button size="sm" onClick={save} loading={saving} disabled={saving}>
          {saved ? "Сохранено" : "Сохранить"}
        </Button>
        {source === "manual" && (
          <Button size="sm" variant="ghost" onClick={resetToPoster} loading={resetting} disabled={resetting}>
            Сбросить на Poster
          </Button>
        )}
      </div>
    </li>
  );
}
