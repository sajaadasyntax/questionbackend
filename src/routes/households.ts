import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { intField } from '../lib/validators';
import { buildScopeWhere } from '../lib/scopeFilter';

const router = Router();
router.use(authenticate);

const householdSchema = z.object({
  headOfFamilyName: z.string().min(1, 'اسم رب الأسرة مطلوب'),
  address: z.string().optional(),
  geoLat: z.number().optional(),
  geoLng: z.number().optional(),
  surveyDate: z.string().optional(),
  neighborhoodId: z.string().min(1, 'الحي مطلوب'),

  demographicInfo: z.object({
    totalFamilyMembers: intField(),
    totalPopulationMale: intField(),
    totalPopulationFemale: intField(),
    householdCount: intField(),
    children0to6mMale: intField(),
    children0to6mFemale: intField(),
    children0to12mMale: intField(),
    children0to12mFemale: intField(),
    childrenUnder5Male: intField(),
    childrenUnder5Female: intField(),
    children6to14Male: intField(),
    children6to14Female: intField(),
    population15plusMale: intField(),
    population15plusFemale: intField(),
    womenReproductive15to49: intField(),
    elderlyOver70Male: intField(),
    elderlyOver70Female: intField(),
    marriedWomen: intField(),
    divorcedWidowedWomen: intField(),
  }).optional(),

  educationInfo: z.object({
    children4to6: intField(),
    children4to6Enrolled: intField(),
    children4to6NotEnrolled: intField(),
    dropoutsLastYear: intField(),
    completedBasicMale: intField(),
    completedBasicFemale: intField(),
    completedSecondaryMale: intField(),
    completedSecondaryFemale: intField(),
    completedUniversityMale: intField(),
    completedUniversityFemale: intField(),
    completedPostGradMale: intField(),
    completedPostGradFemale: intField(),
    illiterateMale: intField(),
    illiterateFemale: intField(),
  }).optional(),

  waterInfo: z.object({
    publicNetwork: intField(),
    indoorTank: intField(),
    outdoorTank: intField(),
    hafir: intField(),
    well: intField(),
    otherSource: intField(),
    otherSourceDesc: z.string().optional(),
    hasEnoughWater: intField(),
  }).optional(),

  housingInfo: z.object({
    housingType: z.enum(['APARTMENT', 'ROOFED_HOUSE', 'RED_BRICK', 'GREEN_BRICK_OR_MUD', 'OTHER']).optional().nullable(),
    numberOfRooms: intField(),
    roofType: z.string().optional(),
    ownershipType: z.enum(['PURCHASE', 'INHERITANCE', 'RENT', 'SHARED_INHERITANCE']).optional().nullable(),
    ownershipProof: z.enum(['SEARCH_CERTIFICATE', 'POSSESSION_CERTIFICATE', 'NONE']).optional().nullable(),
    sleepingRooms: intField(),
    ventilationOpenings: intField(),
    separateKitchenCount: intField(),
    noToilet: intField(),
    basicPitToilet: intField(),
    improvedPitToilet: intField(),
    siphonToilet: intField(),
    otherToilet: intField(),
    properWasteDisposal: intField(),
  }).optional(),

  headOfFamilyInfo: z.object({
    age: z.number().int().min(0).optional().nullable(),
    profession: z.string().optional(),
    income: z.number().optional().nullable(),
    ownsOtherProperty: z.boolean().default(false),
    otherPropertyLocation: z.enum(['INSIDE_VILLAGE', 'OUTSIDE_VILLAGE']).optional().nullable(),
    otherPropertyWhere: z.string().optional(),
    otherPropertyKind: z.enum(['RESIDENTIAL_SHOP', 'RESIDENTIAL_HOUSE', 'COMMERCIAL_OTHER']).optional().nullable(),
  }).optional(),

  vehicles: z.array(z.object({
    vehicleType: z.enum(['KARO', 'RAQSHA', 'MOTOR', 'MOTOR_WHEEL', 'TUKTUK', 'SMALL_SALOON', 'STATION', 'SINGLE_PICKUP', 'DOUBLE_PICKUP', 'DAFAR', 'LORRY', 'TRUCK', 'TRACTOR', 'AGRI_TRACTOR', 'LOADER', 'EXCAVATOR']),
  })).optional(),

  agricultureInfo: z.object({
    ownsAgriculturalLand: intField(),
    cultivatesLand: intField(),
    pumpIrrigation: intField(),
    solarIrrigation: intField(),
    usesTechnicalExperts: intField(),
  }).optional(),

  livestockInfo: z.object({
    raisesLivestock: intField(),
    cattle: intField(),
    sheep: intField(),
    goats: intField(),
    camels: intField(),
    otherLivestock: intField(),
    separateLivestockBarns: intField(),
    raisesPoultry: intField(),
    chicken: intField(),
    pigeon: intField(),
    otherPoultry: intField(),
    separatePoultryHousing: intField(),
  }).optional(),

  childHealthInfo: z.object({
    birthsLastYearMale: intField(),
    birthsLastYearFemale: intField(),
    liveBirthsMale: intField(),
    liveBirthsFemale: intField(),
    stillBirthsMale: intField(),
    stillBirthsFemale: intField(),
    birthsWithDefectsMale: intField(),
    birthsWithDefectsFemale: intField(),
    under5IllLast2WeeksMale: intField(),
    under5IllLast2WeeksFemale: intField(),
    under5PneumoniaLast2WeeksMale: intField(),
    under5PneumoniaLast2WeeksFemale: intField(),
    under5DiarrheaLast2WeeksMale: intField(),
    under5DiarrheaLast2WeeksFemale: intField(),
    under5FeverLast2WeeksMale: intField(),
    under5FeverLast2WeeksFemale: intField(),
    infant0to12mDeathsMale: intField(),
    infant0to12mDeathsFemale: intField(),
    infantTetanusDeathsMale: intField(),
    infantTetanusDeathsFemale: intField(),
    infantPneumoniaDeathsMale: intField(),
    infantPneumoniaDeathsFemale: intField(),
    infantDiarrheaDeathsMale: intField(),
    infantDiarrheaDeathsFemale: intField(),
    infantFeverDeathsMale: intField(),
    infantFeverDeathsFemale: intField(),
    infantOtherDeathsMale: intField(),
    infantOtherDeathsFemale: intField(),
    under5DeathsMale: intField(),
    under5DeathsFemale: intField(),
    under5PneumoniaDeathsMale: intField(),
    under5PneumoniaDeathsFemale: intField(),
    under5DiarrheaDeathsMale: intField(),
    under5DiarrheaDeathsFemale: intField(),
    under5FeverDeathsMale: intField(),
    under5FeverDeathsFemale: intField(),
    under5OtherDeathsMale: intField(),
    under5OtherDeathsFemale: intField(),
  }).optional(),

  vaccinationInfo: z.object({
    infant0to1HasCard: intField(),
    infant0to1Penta1: intField(),
    infant0to1Penta2: intField(),
    infant0to1Penta3: intField(),
    infant0to1BCG: intField(),
    infant0to1Measles: intField(),
    child1to5HasCard: intField(),
    child1to5Penta1: intField(),
    child1to5Penta2: intField(),
    child1to5Penta3: intField(),
    child1to5BCG: intField(),
    child1to5Measles: intField(),
  }).optional(),

  reproductiveHealth: z.object({
    pregnantCount: intField(),
    pregnantTrimester1: intField(),
    pregnantTrimester2: intField(),
    pregnantTrimester3: intField(),
    pregnantFollowedByHealthWorker: intField(),
    pregnantTetanusTotal: intField(),
    pregnantTetanusDose1: intField(),
    pregnantTetanusDose2: intField(),
    pregnantTetanusDose3: intField(),
    birthSpacingUnder1Year: intField(),
    birthSpacing1to2Years: intField(),
    birthSpacingOver2Years: intField(),
    deliveriesLastYear: intField(),
    deliveriesByTrainedStaff: intField(),
    deliveriesByUntrainedStaff: intField(),
    postnatalVisitsByTrainedStaff: intField(),
    maternalDeathsPregnancy: intField(),
    maternalDeathsBirth: intField(),
    maternalDeathsPostpartum: intField(),
    familyPlanningUsers: intField(),
  }).optional(),

  developmentalAssets: z.object({
    incomeProject: intField(),
    canteen: intField(),
    livestock: intField(),
    mill: intField(),
    oven: intField(),
    poultry: intField(),
    cart: intField(),
    farm: intField(),
    vehicle: intField(),
  }).optional(),

  generalInfo: z.object({
    isMigrant: z.boolean().default(false),
    migrationTiming: z.enum(['BEFORE_WAR', 'AFTER_WAR']).optional().nullable(),
    homeStatus: z.enum(['OWNED', 'RENTED']).optional().nullable(),
    hasChronicCondition: z.boolean().default(false),
    chronicConditions: z.array(z.enum(['DIABETES', 'HYPERTENSION', 'ASTHMA', 'HEADACHE', 'KIDNEY', 'OTHER'])).default([]),
    chronicOtherDesc: z.string().optional(),
    hasDisability: z.boolean().default(false),
    disabilities: z.array(z.enum(['MOTOR', 'VISUAL', 'HEARING', 'MENTAL', 'OTHER'])).default([]),
    disabilityOtherDesc: z.string().optional(),
    hasCancer: z.boolean().default(false),
    hasHealthInsurance: z.boolean().default(false),
    insuranceProvider: z.enum(['GOVERNMENT', 'REGULAR_FORCES', 'ZAKAT', 'FEDERAL_FINANCE', 'STATE_FINANCE', 'COMPANIES', 'SELF']).optional().nullable(),
    receivesSupport: z.boolean().default(false),
    supportKafalaOrphan: z.boolean().default(false),
    supportZakatDiwan: z.boolean().default(false),
    supportSocialWelfare: z.boolean().default(false),
  }).optional(),
});

const HOUSEHOLD_INCLUDE = {
  neighborhood: {
    include: {
      village: {
        include: {
          administrativeUnit: {
            include: { locality: true },
          },
        },
      },
    },
  },
  collectedBy: { select: { id: true, name: true, username: true } },
  demographicInfo: true,
  educationInfo: true,
  waterInfo: true,
  housingInfo: true,
  headOfFamilyInfo: true,
  agricultureInfo: true,
  livestockInfo: true,
  childHealthInfo: true,
  vaccinationInfo: true,
  reproductiveHealth: true,
  developmentalAssets: true,
  vehicles: true,
  generalInfo: true,
  certificate: true,
};

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { neighborhoodId, villageId, administrativeUnitId, localityId, collectedById, dateFrom, dateTo, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = buildScopeWhere(req.user!);
    if (req.user!.role === 'COLLECTOR') where.collectedById = req.user!.userId;
    if (collectedById && (req.user!.role === 'ADMIN' || req.user!.role === 'LOCALITY_MANAGER')) where.collectedById = collectedById as string;
    if (neighborhoodId) where.neighborhoodId = neighborhoodId as string;
    if (villageId) where.neighborhood = { villageId: villageId as string };
    if (administrativeUnitId) where.neighborhood = { village: { administrativeUnitId: administrativeUnitId as string } };
    if (localityId) where.neighborhood = { village: { administrativeUnit: { localityId: localityId as string } } };
    if (dateFrom || dateTo) {
      where.surveyDate = {
        ...(dateFrom ? { gte: new Date(dateFrom as string) } : {}),
        ...(dateTo ? { lte: new Date(dateTo as string) } : {}),
      };
    }

    const [total, households] = await Promise.all([
      prisma.household.count({ where }),
      prisma.household.findMany({
        where,
        include: {
          neighborhood: {
            include: {
              village: {
                include: { administrativeUnit: { include: { locality: true } } },
              },
            },
          },
          collectedBy: { select: { id: true, name: true } },
          certificate: { select: { id: true } },
        },
        orderBy: { surveyDate: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
    ]);

    res.json({ data: households, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where: Record<string, unknown> = { id: req.params.id as string };
    if (req.user!.role === 'COLLECTOR') where.collectedById = req.user!.userId;

    const household = await prisma.household.findFirst({ where, include: HOUSEHOLD_INCLUDE });
    if (!household) {
      res.status(404).json({ message: 'الأسرة غير موجودة' });
      return;
    }
    res.json(household);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = householdSchema.parse(req.body);

    const household = await prisma.household.create({
      data: {
        headOfFamilyName: data.headOfFamilyName,
        address: data.address,
        geoLat: data.geoLat,
        geoLng: data.geoLng,
        surveyDate: data.surveyDate ? new Date(data.surveyDate) : new Date(),
        neighborhoodId: data.neighborhoodId,
        collectedById: req.user!.userId,
        ...(data.demographicInfo && { demographicInfo: { create: data.demographicInfo } }),
        ...(data.educationInfo && { educationInfo: { create: data.educationInfo } }),
        ...(data.waterInfo && { waterInfo: { create: data.waterInfo } }),
        ...(data.housingInfo && { housingInfo: { create: data.housingInfo } }),
        ...(data.headOfFamilyInfo && { headOfFamilyInfo: { create: data.headOfFamilyInfo } }),
        ...(data.vehicles?.length && { vehicles: { create: data.vehicles } }),
        ...(data.agricultureInfo && { agricultureInfo: { create: data.agricultureInfo } }),
        ...(data.livestockInfo && { livestockInfo: { create: data.livestockInfo } }),
        ...(data.childHealthInfo && { childHealthInfo: { create: data.childHealthInfo } }),
        ...(data.vaccinationInfo && { vaccinationInfo: { create: data.vaccinationInfo } }),
        ...(data.reproductiveHealth && { reproductiveHealth: { create: data.reproductiveHealth } }),
        ...(data.developmentalAssets && { developmentalAssets: { create: data.developmentalAssets } }),
        ...(data.generalInfo && { generalInfo: { create: data.generalInfo } }),
      },
      include: HOUSEHOLD_INCLUDE,
    });

    res.status(201).json(household);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const householdId = req.params.id as string;
    const data = householdSchema.parse(req.body);
    const where: Record<string, unknown> = { id: householdId };
    if (req.user!.role === 'COLLECTOR') where.collectedById = req.user!.userId;

    const existing = await prisma.household.findFirst({ where });
    if (!existing) {
      res.status(404).json({ message: 'الأسرة غير موجودة' });
      return;
    }

    const upsertRelation = <T extends object>(relation: T | undefined, existingId: string) => {
      if (!relation) return undefined;
      return {
        upsert: {
          where: { householdId: existingId },
          update: relation,
          create: relation,
        },
      };
    };

    // Vehicles: delete existing and recreate
    if (data.vehicles !== undefined) {
      await prisma.householdVehicle.deleteMany({ where: { householdId } });
    }

    const household = await prisma.household.update({
      where: { id: householdId },
      data: {
        headOfFamilyName: data.headOfFamilyName,
        address: data.address,
        geoLat: data.geoLat,
        geoLng: data.geoLng,
        surveyDate: data.surveyDate ? new Date(data.surveyDate) : undefined,
        neighborhoodId: data.neighborhoodId,
        demographicInfo: upsertRelation(data.demographicInfo, householdId),
        educationInfo: upsertRelation(data.educationInfo, householdId),
        waterInfo: upsertRelation(data.waterInfo, householdId),
        housingInfo: upsertRelation(data.housingInfo, householdId),
        headOfFamilyInfo: upsertRelation(data.headOfFamilyInfo, householdId),
        agricultureInfo: upsertRelation(data.agricultureInfo, householdId),
        livestockInfo: upsertRelation(data.livestockInfo, householdId),
        childHealthInfo: upsertRelation(data.childHealthInfo, householdId),
        vaccinationInfo: upsertRelation(data.vaccinationInfo, householdId),
        reproductiveHealth: upsertRelation(data.reproductiveHealth, householdId),
        developmentalAssets: upsertRelation(data.developmentalAssets, householdId),
        generalInfo: upsertRelation(data.generalInfo, householdId),
        ...(data.vehicles?.length && { vehicles: { create: data.vehicles } }),
      },
      include: HOUSEHOLD_INCLUDE,
    });

    res.json(household);
  } catch (err) {
    next(err);
  }
});

export default router;
