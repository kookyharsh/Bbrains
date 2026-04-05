/*
  Warnings:

  - You are about to drop the `_AnnouncementToCollege` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AnnouncementToCollege" DROP CONSTRAINT "_AnnouncementToCollege_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnnouncementToCollege" DROP CONSTRAINT "_AnnouncementToCollege_B_fkey";

-- AlterTable
ALTER TABLE "announcement" ADD COLUMN     "is_global" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "college_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "course" ADD COLUMN     "college_id" INTEGER;

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "college_id" INTEGER;

-- DropTable
DROP TABLE "_AnnouncementToCollege";

-- CreateTable
CREATE TABLE "permission" (
    "permission_id" SERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "category" VARCHAR(50) NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_key_key" ON "permission"("key");

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "college"("college_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "college"("college_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "college"("college_id") ON DELETE CASCADE ON UPDATE CASCADE;
