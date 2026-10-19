// Характеристики товара по типам (SpecType в БД, правится в /admin/spec-types).
// Четыре поля уже есть колонками Product (их используют фильтры каталога и
// парсер Poster) — поэтому поле с таким названием пишется в колонку, а не в
// Product.specs. Любое другое название — в specs по ключу-названию.

export const COLUMN_FIELDS = {
  "Бренд": "brand",
  "Вкус": "flavor",
  "Крепость": "strength",
  "Вес упаковки": "packaging",
  "Вес": "packaging",
} as const;

export type ColumnKey = (typeof COLUMN_FIELDS)[keyof typeof COLUMN_FIELDS];

export function columnFor(label: string): ColumnKey | undefined {
  return (COLUMN_FIELDS as Record<string, ColumnKey>)[label];
}

export type SpecValues = Record<string, string>;

/** Значения полей типа в порядке fields; пустые пропускаются. */
export function buildSpecList(
  fields: string[],
  product: Partial<Record<ColumnKey, string | null>>,
  specs: unknown
): { label: string; value: string }[] {
  const stored = (specs && typeof specs === "object" ? specs : {}) as SpecValues;
  return fields.flatMap((label) => {
    const col = columnFor(label);
    const value = ((col ? product[col] : stored[label]) ?? "").trim();
    return value ? [{ label, value }] : [];
  });
}
