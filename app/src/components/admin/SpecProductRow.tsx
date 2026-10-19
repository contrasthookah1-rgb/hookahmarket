"use client";

import { useState } from "react";
import { saveProductSpecs } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { columnFor, type ColumnKey, type SpecValues } from "@/lib/spec-types";

export interface SpecTypeOption {
  id: number;
  name: string;
  fields: string[];
}

export function SpecProductRow({
  productId,
  name,
  categoryLabel,
  specTypeId,
  columns,
  specs,
  types,
}: {
  productId: number;
  name: string;
  categoryLabel: string;
  specTypeId: number | null;
  columns: Record<ColumnKey, string | null>;
  specs: SpecValues;
  types: SpecTypeOption[];
}) {
  const [typeId, setTypeId] = useState(specTypeId);
  const [values, setValues] = useState<SpecValues>(specs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const type = types.find((t) => t.id === typeId);
  const valueOf = (label: string) => {
    if (label in values) return values[label];
    const col = columnFor(label);
    return (col ? columns[col] : specs[label]) ?? "";
  };

  const save = async () => {
    setSaving(true);
    await saveProductSpecs(
      productId,
      typeId,
      Object.fromEntries((type?.fields ?? []).map((f) => [f, valueOf(f)]))
    );
    setSaving(false);
    setSaved(true);
  };

  return (
    <li className="rounded-md border border-border p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-body text-sm text-foreground">{name}</div>
          <div className="font-body text-xs text-foreground-muted">{categoryLabel}</div>
        </div>
        <div className="flex items-end gap-3">
          <div className="w-64">
            <Select
              name={`type-${productId}`}
              value={typeId ?? ""}
              onChange={(e) => {
                setSaved(false);
                setTypeId(e.target.value ? Number(e.target.value) : null);
              }}
              options={[{ value: "", label: "— тип не выбран —" }, ...types.map((t) => ({ value: String(t.id), label: t.name }))]}
            />
          </div>
          <Button size="sm" onClick={save} loading={saving} disabled={saving}>
            {saved ? "Сохранено" : "Сохранить"}
          </Button>
        </div>
      </div>
      {type && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {type.fields.map((label) => (
            <Input
              key={label}
              name={`${label}-${productId}`}
              label={label}
              value={valueOf(label)}
              onChange={(e) => {
                setSaved(false);
                setValues((v) => ({ ...v, [label]: e.target.value }));
              }}
            />
          ))}
        </div>
      )}
    </li>
  );
}
