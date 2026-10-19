"use client";

import { useState } from "react";
import { deleteSpecType, saveSpecType } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// id === undefined → форма «Добавить тип»
export function SpecTypeForm({
  id,
  name = "",
  groupName = "",
  fields = [],
}: {
  id?: number;
  name?: string;
  groupName?: string;
  fields?: string[];
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="rounded-md border border-border p-4"
      action={async (formData) => {
        setSaving(true);
        const res = await saveSpecType(formData);
        setSaving(false);
        setStatus(res.error ?? "Сохранено");
      }}
    >
      {id && <input type="hidden" name="id" value={id} />}
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <Input name="name" label="Название типа" defaultValue={name} required />
        <Input name="groupName" label="Группа" defaultValue={groupName} required />
      </div>
      <label className="flex flex-col gap-1.5 font-body">
        <span className="text-xs tracking-wide text-foreground-secondary">Поля — по одному на строку</span>
        <textarea
          name="fields"
          defaultValue={fields.join("\n")}
          rows={Math.max(4, fields.length + 1)}
          required
          className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-base text-foreground outline-none focus:border-focus-ring"
        />
      </label>
      <div className="mt-3 flex items-center gap-3">
        <Button size="sm" type="submit" loading={saving} disabled={saving}>
          {id ? "Сохранить" : "Добавить"}
        </Button>
        {id && (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={async () => {
              if (!confirm(`Удалить тип «${name}»? У товаров этого типа тип сбросится, введённые значения останутся.`)) return;
              await deleteSpecType(id);
            }}
          >
            Удалить
          </Button>
        )}
        {status && <span className="font-body text-sm text-foreground-muted">{status}</span>}
      </div>
    </form>
  );
}
