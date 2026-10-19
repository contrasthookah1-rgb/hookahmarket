"use client";

import { useState } from "react";
import {
  addLoungeImages,
  deleteLoungeImage,
  deleteLoungeVenue,
  reorderLoungeImages,
  saveLoungeVenue,
} from "@/app/admin/actions";
import { PhotoManager, type Img } from "@/components/admin/PhotoManager";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// id === undefined → форма «Добавить точку» (фото добавляются после первого сохранения)
export function LoungeVenueForm({
  id,
  name = "",
  address = "",
  hours = "",
  mapUrl = "",
  images = [],
}: {
  id?: number;
  name?: string;
  address?: string;
  hours?: string;
  mapUrl?: string;
  images?: Img[];
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <div className="rounded-md border border-border p-4">
      <form
        action={async (formData) => {
          setSaving(true);
          const res = await saveLoungeVenue(formData);
          setSaving(false);
          setStatus(res.error ?? "Сохранено");
        }}
      >
        {id && <input type="hidden" name="id" value={id} />}
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <Input name="name" label="Название точки" defaultValue={name} required />
          <Input name="address" label="Адрес" defaultValue={address} required />
          <Input name="hours" label="Часы работы" defaultValue={hours} required />
          <Input name="mapUrl" label="Ссылка на 2ГИС" defaultValue={mapUrl} placeholder="https://2gis.kz/astana/firm/..." />
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" type="submit" loading={saving} disabled={saving}>
            {id ? "Сохранить" : "Добавить"}
          </Button>
          {id && (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={async () => {
                if (!confirm(`Удалить точку «${name}» вместе с её фото?`)) return;
                await deleteLoungeVenue(id);
              }}
            >
              Удалить точку
            </Button>
          )}
          {status && <span className="font-body text-sm text-foreground-muted">{status}</span>}
        </div>
      </form>
      {id && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="mb-2 font-body text-xs tracking-wide text-foreground-secondary">Фото точки</div>
          <PhotoManager
            images={images}
            mainLabel={false}
            add={(urls) => addLoungeImages(id, urls)}
            reorder={reorderLoungeImages}
            remove={deleteLoungeImage}
          />
        </div>
      )}
    </div>
  );
}
