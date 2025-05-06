-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_review_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_shop_id_fkey";

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "shop_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
