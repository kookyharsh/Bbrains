/*
  Warnings:

  - A unique constraint covering the columns `[qr_code]` on the table `order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `college_id` to the `announcement` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `order` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('digital', 'physical');

-- AlterEnum
ALTER TYPE "ProductApproval" ADD VALUE 'draft';

-- AlterTable
ALTER TABLE "announcement" ADD COLUMN     "college_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "orderType" TEXT NOT NULL DEFAULT 'physical',
ADD COLUMN     "qr_code" TEXT,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'order_placed';

-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "delivery_status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "product_type" "ProductType" NOT NULL DEFAULT 'physical';

-- AlterTable
ALTER TABLE "submission" ADD COLUMN     "content" TEXT;

-- AlterTable
ALTER TABLE "transaction_history" ALTER COLUMN "recorded_by_id" SET DATA TYPE TEXT,
ALTER COLUMN "related_user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "wallet" ADD COLUMN     "heldBalance" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- CreateTable
CREATE TABLE "review" (
    "review_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "acknowledged" (
    "id" SERIAL NOT NULL,
    "announcement_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acknowledged_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnnouncementToCollege" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AnnouncementToCollege_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "review_product_id_idx" ON "review"("product_id");

-- CreateIndex
CREATE INDEX "review_user_id_idx" ON "review"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "acknowledged_announcement_id_user_id_key" ON "acknowledged"("announcement_id", "user_id");

-- CreateIndex
CREATE INDEX "_AnnouncementToCollege_B_index" ON "_AnnouncementToCollege"("B");

-- CreateIndex
CREATE UNIQUE INDEX "order_qr_code_key" ON "order"("qr_code");

-- CreateIndex
CREATE INDEX "order_status_idx" ON "order"("status");

-- CreateIndex
CREATE INDEX "order_qr_code_idx" ON "order"("qr_code");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledged" ADD CONSTRAINT "acknowledged_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledged" ADD CONSTRAINT "acknowledged_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnouncementToCollege" ADD CONSTRAINT "_AnnouncementToCollege_A_fkey" FOREIGN KEY ("A") REFERENCES "announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnouncementToCollege" ADD CONSTRAINT "_AnnouncementToCollege_B_fkey" FOREIGN KEY ("B") REFERENCES "college"("college_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "transaction_history_recorded_by_id_primary_record_transaction_d" RENAME TO "transaction_history_recorded_by_id_primary_record_transacti_idx";
