/*
  Warnings:

  - You are about to drop the column `subject_progress` on the `course` table. All the data in the column will be lost.
  - The primary key for the `wallet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `wallet_id` on the `wallet` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'superadmin';

-- AlterTable
ALTER TABLE "assessment" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "assessment_result" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "course" DROP COLUMN "subject_progress",
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_details" ADD COLUMN     "bio" TEXT;

-- AlterTable
ALTER TABLE "wallet" DROP CONSTRAINT "wallet_pkey",
ALTER COLUMN "wallet_id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "wallet_pkey" PRIMARY KEY ("wallet_id");

-- CreateTable
CREATE TABLE "library" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preference" (
    "preference_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme" TEXT,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preference_pkey" PRIMARY KEY ("preference_id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "message" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "related_id" TEXT,
    "readAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'string',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL DEFAULT 'default',
    "user_id" TEXT NOT NULL,
    "username" TEXT,
    "display_name" TEXT,
    "avatar" TEXT,
    "role" TEXT,
    "content" TEXT NOT NULL,
    "mentions" JSONB DEFAULT '[]',
    "reply_to" TEXT,
    "attachments" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "library_user_id_product_id_key" ON "library"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preference_user_id_key" ON "user_preference"("user_id");

-- CreateIndex
CREATE INDEX "notification_user_id_readAt_idx" ON "notification"("user_id", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- AddForeignKey
ALTER TABLE "library" ADD CONSTRAINT "library_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library" ADD CONSTRAINT "library_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestion" ADD CONSTRAINT "suggestion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
