-- CreateTable
CREATE TABLE "SpecType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "fields" TEXT[],
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SpecType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecType_name_key" ON "SpecType"("name");

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "specTypeId" INTEGER,
ADD COLUMN     "specs" JSONB;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_specTypeId_fkey" FOREIGN KEY ("specTypeId") REFERENCES "SpecType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed: starting list of types/fields from the client (editable in /admin/spec-types)
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Табак для кальяна', 'Табачные изделия и смеси', ARRAY['Бренд', 'Вкус', 'Вкусовое направление', 'Крепость', 'Вес упаковки', 'Состав', 'Страна производства', 'Серия / линейка', 'Тип упаковки'], 0);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Бестабачные смеси', 'Табачные изделия и смеси', ARRAY['Бренд', 'Вкус', 'Состав и основа', 'Крепость или интенсивность', 'Вес', 'Страна производства', 'Тип упаковки'], 1);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Сигареты', 'Табачные изделия и смеси', ARRAY['Бренд', 'Наименование', 'Страна производства', 'Количество штук в пачке', 'Формат', 'Тип упаковки'], 2);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Сигары и сигариллы', 'Табачные изделия и смеси', ARRAY['Бренд', 'Вид изделия', 'Страна производства', 'Состав табака', 'Крепость', 'Длина', 'Диаметр / формат', 'Количество в упаковке'], 3);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Кальяны', 'Кальяны и комплектующие', ARRAY['Бренд', 'Модель', 'Материал шахты', 'Материал основания', 'Высота', 'Цвет', 'Тип соединения', 'Тип продувки', 'Комплектация', 'Страна производства'], 4);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Чаши для кальяна', 'Кальяны и комплектующие', ARRAY['Бренд', 'Модель', 'Материал', 'Тип чаши', 'Объём', 'Высота', 'Диаметр', 'Количество отверстий', 'Совместимость с калаудом', 'Цвет'], 5);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Колбы', 'Кальяны и комплектующие', ARRAY['Бренд', 'Материал', 'Высота', 'Диаметр горловины', 'Форма', 'Цвет', 'Тип соединения', 'Совместимость с моделями кальянов'], 6);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Шланги', 'Кальяны и комплектующие', ARRAY['Бренд', 'Материал', 'Длина', 'Диаметр', 'Цвет', 'Тип соединения', 'Совместимость', 'Комплектация'], 7);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Мундштуки', 'Кальяны и комплектующие', ARRAY['Тип (одноразовый / многоразовый)', 'Материал', 'Длина', 'Диаметр', 'Цвет', 'Количество в упаковке', 'Совместимость'], 8);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Комплектующие', 'Кальяны и комплектующие', ARRAY['Тип детали', 'Бренд', 'Материал', 'Размер', 'Цвет', 'Тип соединения', 'Совместимость с моделями', 'Комплектация'], 9);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Уголь для кальяна', 'Уголь и системы нагрева', ARRAY['Бренд', 'Тип угля', 'Состав', 'Форма', 'Размер кубика', 'Вес упаковки', 'Количество штук', 'Время горения (по данным производителя)', 'Страна производства'], 10);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Калауды', 'Уголь и системы нагрева', ARRAY['Бренд', 'Модель', 'Материал', 'Диаметр', 'Высота', 'Количество отверстий', 'Тип регулировки жара', 'Совместимость с чашами', 'Цвет'], 11);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Щипцы', 'Аксессуары и инструменты', ARRAY['Бренд', 'Материал', 'Длина', 'Форма', 'Цвет', 'Тип наконечника'], 12);
INSERT INTO "SpecType" ("name","groupName","fields","position") VALUES ('Ёршики и средства для чистки', 'Аксессуары и инструменты', ARRAY['Тип изделия', 'Материал', 'Длина', 'Диаметр', 'Назначение', 'Совместимость', 'Объём средства (для жидкостей)'], 13);

-- Pre-select the obvious type for categories that map 1:1
UPDATE "Product" SET "specTypeId" = (SELECT "id" FROM "SpecType" WHERE "name" = 'Табак для кальяна') WHERE "categoryLabel" = 'Табачные смеси для кальяна';
UPDATE "Product" SET "specTypeId" = (SELECT "id" FROM "SpecType" WHERE "name" = 'Бестабачные смеси') WHERE "categoryLabel" = 'Бестабачные смеси для кальяна';
UPDATE "Product" SET "specTypeId" = (SELECT "id" FROM "SpecType" WHERE "name" = 'Сигареты') WHERE "categoryLabel" = 'Сигареты';
UPDATE "Product" SET "specTypeId" = (SELECT "id" FROM "SpecType" WHERE "name" = 'Сигары и сигариллы') WHERE "categoryLabel" = 'Сигары';
UPDATE "Product" SET "specTypeId" = (SELECT "id" FROM "SpecType" WHERE "name" = 'Сигары и сигариллы') WHERE "categoryLabel" = 'Сигариллы';
UPDATE "Product" SET "specTypeId" = (SELECT "id" FROM "SpecType" WHERE "name" = 'Кальяны') WHERE "categoryLabel" = 'Кальяны';
