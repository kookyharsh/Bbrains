/*
  Warnings:

  - The primary key for the `wallet` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "ProductApproval" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "approval" "ProductApproval" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "wallet" DROP CONSTRAINT "wallet_pkey",
ALTER COLUMN "wallet_id" DROP DEFAULT,
ALTER COLUMN "wallet_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "wallet_pkey" PRIMARY KEY ("wallet_id");
DROP SEQUENCE "wallet_wallet_id_seq";

-- CreateTable
CREATE TABLE "event" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "banner" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" VARCHAR(100),
    "type" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streak" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "lastClaimedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_user_id_date_idx" ON "attendance"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "streak_user_id_key" ON "streak"("user_id");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak" ADD CONSTRAINT "streak_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
