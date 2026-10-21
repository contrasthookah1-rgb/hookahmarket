// Real addresses/hours/2ГИС confirmed by the client 2026-09-22 (Astana, not Almaty —
// despite docs/PROJECT_SPEC.md and the tech handover doc saying Алматы).
export type Branch = "left" | "centre" | "alfarabi";

export const BRANCHES: Record<
  Branch,
  { address: string; note: string; hours: string; mapUrl: string }
> = {
  centre: {
    address: "ул. Шокана Уалиханова, 1 (2 этаж)",
    note: "Лаундж-бар и Hookah Market",
    hours: "Ежедневно 11:00–23:00",
    mapUrl: "https://2gis.kz/astana/firm/70000001043815322",
  },
  left: {
    address: "ул. Кайыма Мухамедханова, 4В",
    note: "Лаундж-бар",
    hours: "Пн–Чт, Вс 12:00–02:00, Пт–Сб 12:00–03:00",
    mapUrl: "https://2gis.kz/astana/firm/70000001068513121",
  },
  alfarabi: {
    address: "просп. Аль-Фараби, 9/2",
    note: "Лаундж-бар",
    hours: "Пн–Чт, Вс 12:00–02:00, Пт–Сб 12:00–03:00",
    mapUrl: "https://2gis.kz/astana/firm/70000001109849277",
  },
};

export const INSTAGRAM_URL = "https://instagram.com/contrast.sl";

// Legal entity behind the site — the operator of personal data (Закон РК «О персональных данных»).
// The footer shows "ИП" + name + address (no ИИН); /legal/pdn (currently hidden) shows the full legal entity.
export const OPERATOR_NAME = "Сұлтанов Ерлан Еркінұлы";
export const OPERATOR_ADDRESS =
  "Юридический адрес: Астана, проспект Тұран, д. 55/4";
export const OPERATOR_DETAILS = `ИИН 931027300648 · ${OPERATOR_ADDRESS}`;
