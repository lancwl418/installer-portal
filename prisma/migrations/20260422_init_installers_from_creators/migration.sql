-- ============================================================
-- Step 1: Add new columns (if not already added)
-- ============================================================
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "startingPrice" INTEGER;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "supportedProducts" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "vehicleTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "installTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "hasHardwire" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "hasMultiCamera" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "hasJeepExperience" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "offersMobile" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "offersShop" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "availableThisWeek" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "weekendAvailable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "fastResponse" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "customerQuote" TEXT;
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "facts" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Installer" ADD COLUMN IF NOT EXISTS "completedInstalls" INTEGER NOT NULL DEFAULT 0;

-- ============================================================
-- Step 2: Sync existing Installers with CreatorLink data
--         Match by Installer.instagramUsername = CreatorLink.username
-- ============================================================
UPDATE "Installer" i
SET
  "avatarUrl"  = c."profilePicUrl",
  "customerId" = COALESCE(i."customerId", c."customerId")
FROM "CreatorLink" c
WHERE i."instagramUsername" = c."username"
  AND c."profilePicUrl" IS NOT NULL;

-- ============================================================
-- Step 3: Create Installers from CreatorLinks that don't exist yet
--         Uses displayName as name, email if available
--         passwordHash is bcrypt('installer123') — CHANGE IN PRODUCTION
-- ============================================================
INSERT INTO "Installer" (
  "id", "email", "passwordHash", "name", "phone",
  "instagramUsername", "status", "avatarUrl", "customerId",
  "createdAt", "updatedAt",
  "rating", "reviewCount", "completedInstalls",
  "hasHardwire", "hasMultiCamera", "hasJeepExperience",
  "offersMobile", "offersShop", "availableThisWeek",
  "weekendAvailable", "fastResponse",
  "supportedProducts", "vehicleTypes", "installTypes",
  "tags", "facts"
)
SELECT
  gen_random_uuid()::text,
  COALESCE(c."email", c."username" || '@placeholder.local'),
  -- bcrypt hash of 'installer123' (cost 10) — CHANGE IN PRODUCTION
  '$2b$10$T0Ll/TLhysQC1Up7apWP3e04vvlQUcTKuTTyESGkRsxri/sLavjIi',
  COALESCE(c."displayName", c."username"),
  NULL,
  c."username",
  'active',
  c."profilePicUrl",
  c."customerId",
  NOW(), NOW(),
  0, 0, 0,
  false, false, false,
  false, false, false,
  false, false,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[],
  ARRAY[]::TEXT[], ARRAY[]::TEXT[]
FROM "CreatorLink" c
WHERE NOT EXISTS (
  SELECT 1 FROM "Installer" i
  WHERE i."instagramUsername" = c."username"
)
AND NOT EXISTS (
  SELECT 1 FROM "Installer" i
  WHERE i."email" = c."email"
);

-- ============================================================
-- Step 4: Set all installers to active
-- ============================================================
UPDATE "Installer" SET "status" = 'active' WHERE "status" != 'active';
