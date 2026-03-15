-- Align database schema with Prisma model `Product` (metadata Json?).

ALTER TABLE "product"
ADD COLUMN IF NOT EXISTS "metadata" JSONB;

