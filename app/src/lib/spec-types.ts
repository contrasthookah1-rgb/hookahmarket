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

const TYPE_BY_CATEGORY: Record<string, string> = {
  "Табачные смеси для кальяна": "Табак для кальяна",
  "Бестабачные смеси для кальяна": "Бестабачные смеси",
  "Кальяны": "Кальяны",
  "Чаши": "Чаши для кальяна",
  "Колбы": "Колбы",
  "Сигареты": "Сигареты",
  "Сигары": "Сигары и сигариллы",
  "Сигариллы": "Сигары и сигариллы",
};

// Order matters: "Ершик для колбы" must hit the brush rule before "колб".
// Start-anchored where the word also appears in spare parts ("Пружинка для
// шланга", "Уплотнитель для чаши") that aren't the thing itself.
const PARTS_RULES: [RegExp, string][] = [
  [/^[её]ршик|чистк/i, "Ёршики и средства для чистки"],
  [/мундштук/i, "Мундштуки"],
  [/^шланг/i, "Шланги"],
  [/^(калауд|kaloud)/i, "Калауды"],
  [/^щипц/i, "Щипцы"],
  [/^чаш/i, "Чаши для кальяна"],
  [/^колб/i, "Колбы"],
];

/** Тип товара по категории Poster (и названию внутри «Комплектующих» / «Углей»); null — без типа. */
export function guessSpecTypeName(categoryLabel: string, productName: string): string | null {
  if (categoryLabel === "Комплектующие и аксессуары для кальяна") {
    return PARTS_RULES.find(([re]) => re.test(productName))?.[1] ?? "Комплектующие";
  }
  if (categoryLabel === "Угли и мундштуки") {
    return /мундштук/i.test(productName) ? "Мундштуки" : "Уголь для кальяна";
  }
  return TYPE_BY_CATEGORY[categoryLabel] ?? null;
}
