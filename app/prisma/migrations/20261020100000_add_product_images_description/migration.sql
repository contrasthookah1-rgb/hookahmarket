-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descriptionManual" TEXT;

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Photos uploaded by hand so far become the first photo of the gallery.
-- imageUrl/imageSource go back to "poster" so the next sync restores Poster's
-- own photo as the second-in-line fallback (the manual one is kept in ProductImage).
INSERT INTO "ProductImage" ("productId", "url", "sortOrder")
SELECT "id", "imageUrl", 0 FROM "Product" WHERE "imageSource" = 'manual' AND "imageUrl" IS NOT NULL;

UPDATE "Product" SET "imageSource" = 'poster' WHERE "imageSource" = 'manual';
