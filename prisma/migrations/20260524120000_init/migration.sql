-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COLLECTOR');

-- CreateEnum
CREATE TYPE "WaterSource" AS ENUM ('PUBLIC_NETWORK', 'INDOOR_TANK', 'OUTDOOR_TANK', 'HAFIR', 'WELL', 'OTHER');

-- CreateEnum
CREATE TYPE "ToiletType" AS ENUM ('NONE', 'BASIC_PIT', 'IMPROVED_PIT', 'SIPHON', 'OTHER');

-- CreateEnum
CREATE TYPE "LivestockType" AS ENUM ('CATTLE', 'SHEEP', 'GOATS', 'CAMELS', 'OTHER');

-- CreateEnum
CREATE TYPE "PoultryType" AS ENUM ('CHICKEN', 'PIGEON', 'OTHER');

-- CreateEnum
CREATE TYPE "ChronicCondition" AS ENUM ('DIABETES', 'HYPERTENSION', 'ASTHMA', 'HEADACHE', 'KIDNEY', 'OTHER');

-- CreateEnum
CREATE TYPE "DisabilityType" AS ENUM ('MOTOR', 'VISUAL', 'HEARING', 'MENTAL', 'OTHER');

-- CreateEnum
CREATE TYPE "InsuranceProvider" AS ENUM ('GOVERNMENT', 'REGULAR_FORCES', 'ZAKAT', 'FEDERAL_FINANCE', 'STATE_FINANCE', 'COMPANIES', 'SELF');

-- CreateEnum
CREATE TYPE "MigrationTiming" AS ENUM ('BEFORE_WAR', 'AFTER_WAR');

-- CreateEnum
CREATE TYPE "HomeStatus" AS ENUM ('OWNED', 'RENTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COLLECTOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locality" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Locality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "localityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "headOfFamilyName" TEXT NOT NULL,
    "address" TEXT,
    "geoLat" DOUBLE PRECISION,
    "geoLng" DOUBLE PRECISION,
    "surveyDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "villageId" TEXT NOT NULL,
    "collectedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemographicInfo" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "totalPopulationMale" INTEGER NOT NULL DEFAULT 0,
    "totalPopulationFemale" INTEGER NOT NULL DEFAULT 0,
    "householdCount" INTEGER NOT NULL DEFAULT 0,
    "children0to6mMale" INTEGER NOT NULL DEFAULT 0,
    "children0to6mFemale" INTEGER NOT NULL DEFAULT 0,
    "children0to12mMale" INTEGER NOT NULL DEFAULT 0,
    "children0to12mFemale" INTEGER NOT NULL DEFAULT 0,
    "childrenUnder5Male" INTEGER NOT NULL DEFAULT 0,
    "childrenUnder5Female" INTEGER NOT NULL DEFAULT 0,
    "children6to14Male" INTEGER NOT NULL DEFAULT 0,
    "children6to14Female" INTEGER NOT NULL DEFAULT 0,
    "population15plusMale" INTEGER NOT NULL DEFAULT 0,
    "population15plusFemale" INTEGER NOT NULL DEFAULT 0,
    "womenReproductive15to49" INTEGER NOT NULL DEFAULT 0,
    "elderlyOver70Male" INTEGER NOT NULL DEFAULT 0,
    "elderlyOver70Female" INTEGER NOT NULL DEFAULT 0,
    "marriedWomen" INTEGER NOT NULL DEFAULT 0,
    "divorcedWidowedWomen" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DemographicInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationInfo" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "children4to6" INTEGER NOT NULL DEFAULT 0,
    "children4to6Enrolled" INTEGER NOT NULL DEFAULT 0,
    "children4to6NotEnrolled" INTEGER NOT NULL DEFAULT 0,
    "dropoutsLastYear" INTEGER NOT NULL DEFAULT 0,
    "completedBasicMale" INTEGER NOT NULL DEFAULT 0,
    "completedBasicFemale" INTEGER NOT NULL DEFAULT 0,
    "completedSecondaryMale" INTEGER NOT NULL DEFAULT 0,
    "completedSecondaryFemale" INTEGER NOT NULL DEFAULT 0,
    "completedUniversityMale" INTEGER NOT NULL DEFAULT 0,
    "completedUniversityFemale" INTEGER NOT NULL DEFAULT 0,
    "completedPostGradMale" INTEGER NOT NULL DEFAULT 0,
    "completedPostGradFemale" INTEGER NOT NULL DEFAULT 0,
    "illiterateMale" INTEGER NOT NULL DEFAULT 0,
    "illiterateFemale" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EducationInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterInfo" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "publicNetwork" INTEGER NOT NULL DEFAULT 0,
    "indoorTank" INTEGER NOT NULL DEFAULT 0,
    "outdoorTank" INTEGER NOT NULL DEFAULT 0,
    "hafir" INTEGER NOT NULL DEFAULT 0,
    "well" INTEGER NOT NULL DEFAULT 0,
    "otherSource" INTEGER NOT NULL DEFAULT 0,
    "otherSourceDesc" TEXT,
    "hasEnoughWater" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WaterInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HousingInfo" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "sleepingRooms" INTEGER NOT NULL DEFAULT 0,
    "ventilationOpenings" INTEGER NOT NULL DEFAULT 0,
    "separateKitchenCount" INTEGER NOT NULL DEFAULT 0,
    "noToilet" INTEGER NOT NULL DEFAULT 0,
    "basicPitToilet" INTEGER NOT NULL DEFAULT 0,
    "improvedPitToilet" INTEGER NOT NULL DEFAULT 0,
    "siphonToilet" INTEGER NOT NULL DEFAULT 0,
    "otherToilet" INTEGER NOT NULL DEFAULT 0,
    "properWasteDisposal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HousingInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgricultureInfo" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "ownsAgriculturalLand" INTEGER NOT NULL DEFAULT 0,
    "cultivatesLand" INTEGER NOT NULL DEFAULT 0,
    "pumpIrrigation" INTEGER NOT NULL DEFAULT 0,
    "solarIrrigation" INTEGER NOT NULL DEFAULT 0,
    "usesTechnicalExperts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AgricultureInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivestockInfo" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "raisesLivestock" INTEGER NOT NULL DEFAULT 0,
    "cattle" INTEGER NOT NULL DEFAULT 0,
    "sheep" INTEGER NOT NULL DEFAULT 0,
    "goats" INTEGER NOT NULL DEFAULT 0,
    "camels" INTEGER NOT NULL DEFAULT 0,
    "otherLivestock" INTEGER NOT NULL DEFAULT 0,
    "separateLivestockBarns" INTEGER NOT NULL DEFAULT 0,
    "raisesPoultry" INTEGER NOT NULL DEFAULT 0,
    "chicken" INTEGER NOT NULL DEFAULT 0,
    "pigeon" INTEGER NOT NULL DEFAULT 0,
    "otherPoultry" INTEGER NOT NULL DEFAULT 0,
    "separatePoultryHousing" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LivestockInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildHealthInfo" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "birthsLastYearMale" INTEGER NOT NULL DEFAULT 0,
    "birthsLastYearFemale" INTEGER NOT NULL DEFAULT 0,
    "liveBirthsMale" INTEGER NOT NULL DEFAULT 0,
    "liveBirthsFemale" INTEGER NOT NULL DEFAULT 0,
    "stillBirthsMale" INTEGER NOT NULL DEFAULT 0,
    "stillBirthsFemale" INTEGER NOT NULL DEFAULT 0,
    "birthsWithDefectsMale" INTEGER NOT NULL DEFAULT 0,
    "birthsWithDefectsFemale" INTEGER NOT NULL DEFAULT 0,
    "under5IllLast2WeeksMale" INTEGER NOT NULL DEFAULT 0,
    "under5IllLast2WeeksFemale" INTEGER NOT NULL DEFAULT 0,
    "under5PneumoniaLast2WeeksMale" INTEGER NOT NULL DEFAULT 0,
    "under5PneumoniaLast2WeeksFemale" INTEGER NOT NULL DEFAULT 0,
    "under5DiarrheaLast2WeeksMale" INTEGER NOT NULL DEFAULT 0,
    "under5DiarrheaLast2WeeksFemale" INTEGER NOT NULL DEFAULT 0,
    "under5FeverLast2WeeksMale" INTEGER NOT NULL DEFAULT 0,
    "under5FeverLast2WeeksFemale" INTEGER NOT NULL DEFAULT 0,
    "infant0to12mDeathsMale" INTEGER NOT NULL DEFAULT 0,
    "infant0to12mDeathsFemale" INTEGER NOT NULL DEFAULT 0,
    "infantTetanusDeathsMale" INTEGER NOT NULL DEFAULT 0,
    "infantTetanusDeathsFemale" INTEGER NOT NULL DEFAULT 0,
    "infantPneumoniaDeathsMale" INTEGER NOT NULL DEFAULT 0,
    "infantPneumoniaDeathsFemale" INTEGER NOT NULL DEFAULT 0,
    "infantDiarrheaDeathsMale" INTEGER NOT NULL DEFAULT 0,
    "infantDiarrheaDeathsFemale" INTEGER NOT NULL DEFAULT 0,
    "infantFeverDeathsMale" INTEGER NOT NULL DEFAULT 0,
    "infantFeverDeathsFemale" INTEGER NOT NULL DEFAULT 0,
    "infantOtherDeathsMale" INTEGER NOT NULL DEFAULT 0,
    "infantOtherDeathsFemale" INTEGER NOT NULL DEFAULT 0,
    "under5DeathsMale" INTEGER NOT NULL DEFAULT 0,
    "under5DeathsFemale" INTEGER NOT NULL DEFAULT 0,
    "under5PneumoniaDeathsMale" INTEGER NOT NULL DEFAULT 0,
    "under5PneumoniaDeathsFemale" INTEGER NOT NULL DEFAULT 0,
    "under5DiarrheaDeathsMale" INTEGER NOT NULL DEFAULT 0,
    "under5DiarrheaDeathsFemale" INTEGER NOT NULL DEFAULT 0,
    "under5FeverDeathsMale" INTEGER NOT NULL DEFAULT 0,
    "under5FeverDeathsFemale" INTEGER NOT NULL DEFAULT 0,
    "under5OtherDeathsMale" INTEGER NOT NULL DEFAULT 0,
    "under5OtherDeathsFemale" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChildHealthInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaccinationInfo" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "infant0to1HasCard" INTEGER NOT NULL DEFAULT 0,
    "infant0to1Penta1" INTEGER NOT NULL DEFAULT 0,
    "infant0to1Penta2" INTEGER NOT NULL DEFAULT 0,
    "infant0to1Penta3" INTEGER NOT NULL DEFAULT 0,
    "infant0to1BCG" INTEGER NOT NULL DEFAULT 0,
    "infant0to1Measles" INTEGER NOT NULL DEFAULT 0,
    "child1to5HasCard" INTEGER NOT NULL DEFAULT 0,
    "child1to5Penta1" INTEGER NOT NULL DEFAULT 0,
    "child1to5Penta2" INTEGER NOT NULL DEFAULT 0,
    "child1to5Penta3" INTEGER NOT NULL DEFAULT 0,
    "child1to5BCG" INTEGER NOT NULL DEFAULT 0,
    "child1to5Measles" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VaccinationInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReproductiveHealthInfo" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "pregnantCount" INTEGER NOT NULL DEFAULT 0,
    "pregnantTrimester1" INTEGER NOT NULL DEFAULT 0,
    "pregnantTrimester2" INTEGER NOT NULL DEFAULT 0,
    "pregnantTrimester3" INTEGER NOT NULL DEFAULT 0,
    "pregnantFollowedByHealthWorker" INTEGER NOT NULL DEFAULT 0,
    "pregnantTetanusTotal" INTEGER NOT NULL DEFAULT 0,
    "pregnantTetanusDose1" INTEGER NOT NULL DEFAULT 0,
    "pregnantTetanusDose2" INTEGER NOT NULL DEFAULT 0,
    "pregnantTetanusDose3" INTEGER NOT NULL DEFAULT 0,
    "birthSpacingUnder1Year" INTEGER NOT NULL DEFAULT 0,
    "birthSpacing1to2Years" INTEGER NOT NULL DEFAULT 0,
    "birthSpacingOver2Years" INTEGER NOT NULL DEFAULT 0,
    "deliveriesLastYear" INTEGER NOT NULL DEFAULT 0,
    "deliveriesByTrainedStaff" INTEGER NOT NULL DEFAULT 0,
    "deliveriesByUntrainedStaff" INTEGER NOT NULL DEFAULT 0,
    "postnatalVisitsByTrainedStaff" INTEGER NOT NULL DEFAULT 0,
    "maternalDeathsPregnancy" INTEGER NOT NULL DEFAULT 0,
    "maternalDeathsBirth" INTEGER NOT NULL DEFAULT 0,
    "maternalDeathsPostpartum" INTEGER NOT NULL DEFAULT 0,
    "familyPlanningUsers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReproductiveHealthInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentalAssets" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "incomeProject" INTEGER NOT NULL DEFAULT 0,
    "canteen" INTEGER NOT NULL DEFAULT 0,
    "livestock" INTEGER NOT NULL DEFAULT 0,
    "mill" INTEGER NOT NULL DEFAULT 0,
    "oven" INTEGER NOT NULL DEFAULT 0,
    "poultry" INTEGER NOT NULL DEFAULT 0,
    "cart" INTEGER NOT NULL DEFAULT 0,
    "farm" INTEGER NOT NULL DEFAULT 0,
    "vehicle" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DevelopmentalAssets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralInfo" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "isMigrant" BOOLEAN NOT NULL DEFAULT false,
    "migrationTiming" "MigrationTiming",
    "homeStatus" "HomeStatus",
    "hasChronicCondition" BOOLEAN NOT NULL DEFAULT false,
    "chronicConditions" "ChronicCondition"[],
    "chronicOtherDesc" TEXT,
    "hasDisability" BOOLEAN NOT NULL DEFAULT false,
    "disabilities" "DisabilityType"[],
    "disabilityOtherDesc" TEXT,
    "hasCancer" BOOLEAN NOT NULL DEFAULT false,
    "hasHealthInsurance" BOOLEAN NOT NULL DEFAULT false,
    "insuranceProvider" "InsuranceProvider",

    CONSTRAINT "GeneralInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidenceCertificate" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "committeeArea" TEXT,
    "boundaryNorth" TEXT,
    "boundarySouth" TEXT,
    "boundaryEast" TEXT,
    "boundaryWest" TEXT,
    "areaSqm" DOUBLE PRECISION,
    "issuedById" TEXT NOT NULL,

    CONSTRAINT "ResidenceCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Locality_name_key" ON "Locality"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Village_name_localityId_key" ON "Village"("name", "localityId");

-- CreateIndex
CREATE UNIQUE INDEX "DemographicInfo_householdId_key" ON "DemographicInfo"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationInfo_householdId_key" ON "EducationInfo"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "WaterInfo_householdId_key" ON "WaterInfo"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "HousingInfo_householdId_key" ON "HousingInfo"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "AgricultureInfo_householdId_key" ON "AgricultureInfo"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "LivestockInfo_householdId_key" ON "LivestockInfo"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildHealthInfo_householdId_key" ON "ChildHealthInfo"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "VaccinationInfo_householdId_key" ON "VaccinationInfo"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "ReproductiveHealthInfo_householdId_key" ON "ReproductiveHealthInfo"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "DevelopmentalAssets_householdId_key" ON "DevelopmentalAssets"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneralInfo_householdId_key" ON "GeneralInfo"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "ResidenceCertificate_householdId_key" ON "ResidenceCertificate"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "ResidenceCertificate_certificateNumber_key" ON "ResidenceCertificate"("certificateNumber");

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES "Locality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemographicInfo" ADD CONSTRAINT "DemographicInfo_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationInfo" ADD CONSTRAINT "EducationInfo_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterInfo" ADD CONSTRAINT "WaterInfo_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HousingInfo" ADD CONSTRAINT "HousingInfo_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgricultureInfo" ADD CONSTRAINT "AgricultureInfo_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivestockInfo" ADD CONSTRAINT "LivestockInfo_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildHealthInfo" ADD CONSTRAINT "ChildHealthInfo_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccinationInfo" ADD CONSTRAINT "VaccinationInfo_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReproductiveHealthInfo" ADD CONSTRAINT "ReproductiveHealthInfo_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevelopmentalAssets" ADD CONSTRAINT "DevelopmentalAssets_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralInfo" ADD CONSTRAINT "GeneralInfo_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidenceCertificate" ADD CONSTRAINT "ResidenceCertificate_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidenceCertificate" ADD CONSTRAINT "ResidenceCertificate_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
