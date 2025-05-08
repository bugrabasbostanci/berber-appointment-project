/*
  Warnings:

  - A unique constraint covering the columns `[review_id]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "appointments_review_id_key" ON "appointments"("review_id");

-- CreateIndex
CREATE INDEX "appointments_shop_id_date_idx" ON "appointments"("shop_id", "date");

-- CreateIndex
CREATE INDEX "appointments_employee_id_idx" ON "appointments"("employee_id");

-- CreateIndex
CREATE INDEX "available_times_shop_id_date_idx" ON "available_times"("shop_id", "date");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;
