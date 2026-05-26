-- ============================================================
-- Migration: hierarchy_and_survey_expansion
-- Adds 4-level hierarchy + new survey fields
-- ============================================================

-- ─── New roles ────────────────────────────────────────────────
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'NEIGHBORHOOD_MANAGER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VILLAGE_MANAGER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ADMIN_UNIT_MANAGER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'LOCALITY_MANAGER';

-- ─── New enums ────────────────────────────────────────────────
CREATE TYPE "HousingType" AS ENUM ('APARTMENT', 'ROOFED_HOUSE', 'RED_BRICK', 'GREEN_BRICK_OR_MUD', 'OTHER');
CREATE TYPE "OwnershipType" AS ENUM ('PURCHASE', 'INHERITANCE', 'RENT', 'SHARED_INHERITANCE');
CREATE TYPE "OwnershipProof" AS ENUM ('SEARCH_CERTIFICATE', 'POSSESSION_CERTIFICATE', 'NONE');
CREATE TYPE "VehicleType" AS ENUM ('KARO', 'RAQSHA', 'MOTOR', 'MOTOR_WHEEL', 'TUKTUK', 'SMALL_SALOON', 'STATION', 'SINGLE_PICKUP', 'DOUBLE_PICKUP', 'DAFAR', 'LORRY', 'TRUCK', 'TRACTOR', 'AGRI_TRACTOR', 'LOADER', 'EXCAVATOR');
CREATE TYPE "OtherPropertyLocation" AS ENUM ('INSIDE_VILLAGE', 'OUTSIDE_VILLAGE');
CREATE TYPE "OtherPropertyKind" AS ENUM ('RESIDENTIAL_SHOP', 'RESIDENTIAL_HOUSE', 'COMMERCIAL_OTHER');

-- ─── Scope columns on User ────────────────────────────────────
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "scopeLocalityId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "scopeAdminUnitId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "scopeVillageId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "scopeNeighborhoodId" TEXT;

-- ─── AdministrativeUnit ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AdministrativeUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "localityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdministrativeUnit_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AdministrativeUnit_name_localityId_key" ON "AdministrativeUnit"("name", "localityId");
ALTER TABLE "AdministrativeUnit"
    ADD CONSTRAINT "AdministrativeUnit_localityId_fkey"
    FOREIGN KEY ("localityId") REFERENCES "Locality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one default AdministrativeUnit per existing Locality
INSERT INTO "AdministrativeUnit" ("id", "name", "localityId", "createdAt")
SELECT gen_random_uuid()::text, 'الوحدة الافتراضية', id, NOW()
FROM "Locality"
ON CONFLICT DO NOTHING;

-- ─── Rewire Village: localityId -> administrativeUnitId ───────
ALTER TABLE "Village" ADD COLUMN IF NOT EXISTS "administrativeUnitId" TEXT;

-- Populate administrativeUnitId from the default unit of each village's locality
UPDATE "Village" v
SET "administrativeUnitId" = au.id
FROM "AdministrativeUnit" au
WHERE au."localityId" = v."localityId"
  AND au."name" = 'الوحدة الافتراضية';

-- Make non-nullable now that data is populated
ALTER TABLE "Village" ALTER COLUMN "administrativeUnitId" SET NOT NULL;

-- Drop old locality FK and column
ALTER TABLE "Village" DROP CONSTRAINT IF EXISTS "Village_localityId_fkey";
DROP INDEX IF EXISTS "Village_name_localityId_key";
ALTER TABLE "Village" DROP COLUMN IF EXISTS "localityId";

-- New unique index and FK
CREATE UNIQUE INDEX IF NOT EXISTS "Village_name_administrativeUnitId_key" ON "Village"("name", "administrativeUnitId");
ALTER TABLE "Village"
    ADD CONSTRAINT "Village_administrativeUnitId_fkey"
    FOREIGN KEY ("administrativeUnitId") REFERENCES "AdministrativeUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Neighborhood ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Neighborhood" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Neighborhood_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Neighborhood_name_villageId_key" ON "Neighborhood"("name", "villageId");
ALTER TABLE "Neighborhood"
    ADD CONSTRAINT "Neighborhood_villageId_fkey"
    FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one default Neighborhood per existing Village
INSERT INTO "Neighborhood" ("id", "name", "villageId", "createdAt")
SELECT gen_random_uuid()::text, 'الحي الرئيسي', id, NOW()
FROM "Village"
ON CONFLICT DO NOTHING;

-- ─── Rewire Household: villageId -> neighborhoodId ────────────
ALTER TABLE "Household" ADD COLUMN IF NOT EXISTS "neighborhoodId" TEXT;

UPDATE "Household" h
SET "neighborhoodId" = n.id
FROM "Neighborhood" n
WHERE n."villageId" = h."villageId"
  AND n."name" = 'الحي الرئيسي';

ALTER TABLE "Household" ALTER COLUMN "neighborhoodId" SET NOT NULL;

ALTER TABLE "Household" DROP CONSTRAINT IF EXISTS "Household_villageId_fkey";
ALTER TABLE "Household" DROP COLUMN IF EXISTS "villageId";

ALTER TABLE "Household"
    ADD CONSTRAINT "Household_neighborhoodId_fkey"
    FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── HousingInfo extensions ───────────────────────────────────
ALTER TABLE "HousingInfo" ADD COLUMN IF NOT EXISTS "housingType" "HousingType";
ALTER TABLE "HousingInfo" ADD COLUMN IF NOT EXISTS "numberOfRooms" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "HousingInfo" ADD COLUMN IF NOT EXISTS "roofType" TEXT;
ALTER TABLE "HousingInfo" ADD COLUMN IF NOT EXISTS "ownershipType" "OwnershipType";
ALTER TABLE "HousingInfo" ADD COLUMN IF NOT EXISTS "ownershipProof" "OwnershipProof";

-- ─── HeadOfFamilyInfo ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "HeadOfFamilyInfo" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "age" INTEGER,
    "profession" TEXT,
    "income" DOUBLE PRECISION,
    "ownsOtherProperty" BOOLEAN NOT NULL DEFAULT false,
    "otherPropertyLocation" "OtherPropertyLocation",
    "otherPropertyWhere" TEXT,
    "otherPropertyKind" "OtherPropertyKind",
    CONSTRAINT "HeadOfFamilyInfo_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "HeadOfFamilyInfo_householdId_key" ON "HeadOfFamilyInfo"("householdId");
ALTER TABLE "HeadOfFamilyInfo"
    ADD CONSTRAINT "HeadOfFamilyInfo_householdId_fkey"
    FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── HouseholdVehicle ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "HouseholdVehicle" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    CONSTRAINT "HouseholdVehicle_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "HouseholdVehicle"
    ADD CONSTRAINT "HouseholdVehicle_householdId_fkey"
    FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── DemographicInfo extensions ───────────────────────────────
ALTER TABLE "DemographicInfo" ADD COLUMN IF NOT EXISTS "totalFamilyMembers" INTEGER NOT NULL DEFAULT 0;

-- ─── GeneralInfo extensions ───────────────────────────────────
ALTER TABLE "GeneralInfo" ADD COLUMN IF NOT EXISTS "receivesSupport" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "GeneralInfo" ADD COLUMN IF NOT EXISTS "supportKafalaOrphan" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "GeneralInfo" ADD COLUMN IF NOT EXISTS "supportZakatDiwan" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "GeneralInfo" ADD COLUMN IF NOT EXISTS "supportSocialWelfare" BOOLEAN NOT NULL DEFAULT false;
