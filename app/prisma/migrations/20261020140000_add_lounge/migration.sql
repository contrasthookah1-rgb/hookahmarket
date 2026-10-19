-- CreateTable
CREATE TABLE "LoungeSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "heroImageUrl" TEXT,
    "whatsappNumber" TEXT,

    CONSTRAINT "LoungeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoungeVenue" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "mapUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LoungeVenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoungeImage" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LoungeImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoungeImage_venueId_sortOrder_idx" ON "LoungeImage"("venueId", "sortOrder");

-- AddForeignKey
ALTER TABLE "LoungeImage" ADD CONSTRAINT "LoungeImage_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "LoungeVenue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: what /lounge showed before it became editable (photos live in public/lounge),
-- with the client's draft copy (2026-10-19). Editable in /admin/lounge.
INSERT INTO "LoungeSettings" ("id", "title", "subtitle", "bodyHtml", "heroImageUrl") VALUES (
  1,
  'Contrast Lounge',
  'Две кальянные Contrast в Астане — на Аль-Фараби и на Мухамедханова. Тёмные спокойные залы, мягкие диваны и кальяны на табаках, которые продаются в нашем магазине.',
  '<h2>Работаем допоздна</h2><p>Пн–Чт и Вс — с 12:00 до 02:00, Пт и Сб — до 03:00.</p><h2>Кэшбэк 3%</h2><p>С каждого заказа в лаунже и покупки в магазине на карту Contrast.</p><h2>Забронировать стол</h2><p>Напишите нам в WhatsApp — подберём зал и время.</p>',
  '/lounge/alfarabi-hero.jpg'
);

INSERT INTO "LoungeVenue" ("name", "address", "hours", "mapUrl", "sortOrder") VALUES
  ('Аль-Фараби', 'просп. Аль-Фараби, 9/2', 'Пн–Чт, Вс 12:00–02:00, Пт–Сб 12:00–03:00', 'https://2gis.kz/astana/firm/70000001109849277', 0),
  ('Мухамедханова', 'ул. Кайыма Мухамедханова, 4В', 'Пн–Чт, Вс 12:00–02:00, Пт–Сб 12:00–03:00', 'https://2gis.kz/astana/firm/70000001068513121', 1);

INSERT INTO "LoungeImage" ("venueId", "url", "sortOrder") VALUES
  ((SELECT "id" FROM "LoungeVenue" WHERE "name" = 'Аль-Фараби'), '/lounge/alfarabi-1.jpg', 0),
  ((SELECT "id" FROM "LoungeVenue" WHERE "name" = 'Аль-Фараби'), '/lounge/alfarabi-2.jpg', 1),
  ((SELECT "id" FROM "LoungeVenue" WHERE "name" = 'Мухамедханова'), '/lounge/mukhamedkhanova-1.jpg', 0),
  (NULL, '/lounge/gallery-1.jpg', 0),
  (NULL, '/lounge/gallery-2.jpg', 1),
  (NULL, '/lounge/gallery-3.jpg', 2);
