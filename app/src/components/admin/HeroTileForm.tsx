"use client";

import { useState } from "react";
import { resetHeroTile, saveHeroTile } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const SLOT_NAMES = ["Верхнее левое", "Верхнее правое", "Нижнее левое", "Нижнее правое"];

export function HeroTileForm({
  slot,
  initialImageUrl,
  initialLinkUrl,
  isCustom,
}: {
  slot: number;
  initialImageUrl: string;
  initialLinkUrl: string;
  isCustom: boolean;
}) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [linkUrl, setLinkUrl] = useState(initialLinkUrl);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const save = async () => {
    setStatus("saving");
    setError(null);
    const formData = new FormData();
    formData.set("slot", String(slot));
    formData.set("imageUrl", imageUrl);
    formData.set("linkUrl", linkUrl);
    const result = await saveHeroTile(formData);
    if (result?.error) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setStatus("saved");
  };

  // The admin page keys this form on the saved values, so after a reset it
  // remounts with the default photo/link — no local state to clear here.
  const reset = () => resetHeroTile(slot);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-4">
      <div className="flex items-baseline justify-between gap-2 font-body text-sm">
        <span className="text-foreground">{SLOT_NAMES[slot]}</span>
        <span className="text-xs text-foreground-muted">{isCustom ? "своё фото" : "по умолчанию"}</span>
      </div>
      <ImageUploadField value={imageUrl} onChange={setImageUrl} />
      <Input
        label="Куда ведёт клик"
        placeholder="/catalog?category=..."
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
      />
      {error && <p className="font-body text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={save}
          loading={status === "saving"}
          disabled={status === "saving" || !imageUrl || !linkUrl}
        >
          {status === "saved" ? "Сохранено" : "Сохранить"}
        </Button>
        {isCustom && (
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Сбросить
          </Button>
        )}
      </div>
    </div>
  );
}
