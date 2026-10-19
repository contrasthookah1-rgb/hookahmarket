"use client";

import { useState } from "react";
import { saveLoungeSettings } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

export function LoungeSettingsForm({
  initial,
}: {
  initial: { enabled: boolean; title: string; subtitle: string; bodyHtml: string; heroImageUrl: string | null; whatsappNumber: string | null };
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [bodyHtml, setBodyHtml] = useState(initial.bodyHtml);
  const [heroImageUrl, setHeroImageUrl] = useState(initial.heroImageUrl ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(initial.whatsappNumber ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    setStatus("idle");
    set(v);
  };

  const save = async () => {
    setStatus("saving");
    setError(null);
    const res = await saveLoungeSettings({ enabled, title, subtitle, bodyHtml, heroImageUrl, whatsappNumber });
    if (res.error) {
      setError(res.error);
      setStatus("idle");
    } else setStatus("saved");
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border p-4">
      <Checkbox label="Показывать лаунж на сайте (страница, ссылки в меню, блок на главной)" checked={enabled} onChange={(e) => touch(setEnabled)(e.target.checked)} />
      <Input label="Заголовок" value={title} onChange={(e) => touch(setTitle)(e.target.value)} />
      <label className="flex flex-col gap-1.5 font-body">
        <span className="text-xs tracking-wide text-foreground-secondary">Подзаголовок (он же короткий текст блока на главной)</span>
        <textarea
          value={subtitle}
          rows={3}
          onChange={(e) => touch(setSubtitle)(e.target.value)}
          className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-base text-foreground outline-none focus:border-focus-ring"
        />
      </label>
      <div>
        <div className="mb-1.5 font-body text-xs tracking-wide text-foreground-secondary">Главное фото (верх страницы и блок на главной)</div>
        <ImageUploadField value={heroImageUrl} onChange={touch(setHeroImageUrl)} />
      </div>
      <div>
        <div className="mb-1.5 font-body text-xs tracking-wide text-foreground-secondary">Текст</div>
        <RichTextEditor value={bodyHtml} onChange={touch(setBodyHtml)} />
      </div>
      <Input
        label="Номер WhatsApp для кнопки «Забронировать» (цифры, например 77001234567; пусто — номер сайта)"
        value={whatsappNumber}
        onChange={(e) => touch(setWhatsappNumber)(e.target.value)}
      />
      {error && <p className="font-body text-sm text-danger">{error}</p>}
      <div>
        <Button onClick={save} loading={status === "saving"} disabled={status === "saving"}>
          {status === "saved" ? "Сохранено" : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}
