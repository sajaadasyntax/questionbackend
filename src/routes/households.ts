import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const householdSchema = z.object({
  headOfFamilyName: z.string().min(1, 'اسم رب الأسرة مطلوب'),
  address: z.string().optional(),
  geoLat: z.number().optional(),
  geoLng: z.number().optional(),
  surveyDate: z.string().optional(),
  villageId: z.string().min(1, 'القرية مطلوبة'),

  demographicInfo: z.object({
    totalPopulationMale: z.number().int().min(0).default(0),
    totalPopulationFemale: z.number().int().min(0).default(0),
    householdCount: z.number().int().min(0).default(0),
    children0to6mMale: z.number().int().min(0).default(0),
    children0to6mFemale: z.number().int().min(0).default(0),
    children0to12mMale: z.number().int().min(0).default(0),
    children0to12mFemale: z.number().int().min(0).default(0),
    childrenUnder5Male: z.number().int().min(0).default(0),
    childrenUnder5Female: z.number().int().min(0).default(0),
    children6to14Male: z.number().int().min(0).default(0),
    children6to14Female: z.number().int().min(0).default(0),
    population15plusMale: z.number().int().min(0).default(0),
    population15plusFemale: z.number().int().min(0).default(0),
    womenReproductive15to49: z.number().int().min(0).default(0),
    elderlyOver70Male: z.number().int().min(0).default(0),
    elderlyOver70Female: z.number().int().min(0).default(0),
    marriedWomen: z.number().int().min(0).default(0),
    divorcedWidowedWomen: z.number().int().min(0).default(0),
  }).optional(),

  educationInfo: z.object({
    children4to6: z.number().int().min(0).default(0),
    children4to6Enrolled: z.number().int().min(0).default(0),
    children4to6NotEnrolled: z.number().int().min(0).default(0),
    dropoutsLastYear: z.number().int().min(0).default(0),
    completedBasicMale: z.number().int().min(0).default(0),
    completedBasicFemale: z.number().int().min(0).default(0),
    completedSecondaryMale: z.number().int().min(0).default(0),
    completedSecondaryFemale: z.number().int().min(0).default(0),
    completedUniversityMale: z.number().int().min(0).default(0),
    completedUniversityFemale: z.number().int().min(0).default(0),
    completedPostGradMale: z.number().int().min(0).default(0),
    completedPostGradFemale: z.number().int().min(0).default(0),
    illiterateMale: z.number().int().min(0).default(0),
    illiterateFemale: z.number().int().min(0).default(0),
  }).optional(),

  waterInfo: z.object({
    publicNetwork: z.number().int().min(0).default(0),
    indoorTank: z.number().int().min(0).default(0),
    outdoorTank: z.number().int().min(0).default(0),
    hafir: z.number().int().min(0).default(0),
    well: z.number().int().min(0).default(0),
    otherSource: z.number().int().min(0).default(0),
    otherSourceDesc: z.string().optional(),
    hasEnoughWater: z.number().int().min(0).default(0),
  }).optional(),

  housingInfo: z.object({
    sleepingRooms: z.number().int().min(0).default(0),
    ventilationOpenings: z.number().int().min(0).default(0),
    separateKitchenCount: z.number().int().min(0).default(0),
    noToilet: z.number().int().min(0).default(0),
    basicPitToilet: z.number().int().min(0).default(0),
    improvedPitToilet: z.number().int().min(0).default(0),
    siphonToilet: z.number().int().min(0).default(0),
    otherToilet: z.number().int().min(0).default(0),
    properWasteDisposal: z.number().int().min(0).default(0),
  }).optional(),

  agricultureInfo: z.object({
    ownsAgriculturalLand: z.number().int().min(0).default(0),
    cultivatesLand: z.number().int().min(0).default(0),
    pumpIrrigation: z.number().int().min(0).default(0),
    solarIrrigation: z.number().int().min(0).default(0),
    usesTechnicalExperts: z.number().int().min(0).default(0),
  }).optional(),

  livestockInfo: z.object({
    raisesLivestock: z.number().int().min(0).default(0),
    cattle: z.number().int().min(0).default(0),
    sheep: z.number().int().min(0).default(0),
    goats: z.number().int().min(0).default(0),
    camels: z.number().int().min(0).default(0),
    otherLivestock: z.number().int().min(0).default(0),
    separateLivestockBarns: z.number().int().min(0).default(0),
    raisesPoultry: z.number().int().min(0).default(0),
    chicken: z.number().int().min(0).default(0),
    pigeon: z.number().int().min(0).default(0),
    otherPoultry: z.number().int().min(0).default(0),
    separatePoultryHousing: z.number().int().min(0).default(0),
  }).optional(),

  childHealthInfo: z.object({
    birthsLastYearMale: z.number().int().min(0).default(0),
    birthsLastYearFemale: z.number().int().min(0).default(0),
    liveBirthsMale: z.number().int().min(0).default(0),
    liveBirthsFemale: z.number().int().min(0).default(0),
    stillBirthsMale: z.number().int().min(0).default(0),
    stillBirthsFemale: z.number().int().min(0).default(0),
    birthsWithDefectsMale: z.number().int().min(0).default(0),
    birthsWithDefectsFemale: z.number().int().min(0).default(0),
    under5IllLast2WeeksMale: z.number().int().min(0).default(0),
    under5IllLast2WeeksFemale: z.number().int().min(0).default(0),
    under5PneumoniaLast2WeeksMale: z.number().int().min(0).default(0),
    under5PneumoniaLast2WeeksFemale: z.number().int().min(0).default(0),
    under5DiarrheaLast2WeeksMale: z.number().int().min(0).default(0),
    under5DiarrheaLast2WeeksFemale: z.number().int().min(0).default(0),
    under5FeverLast2WeeksMale: z.number().int().min(0).default(0),
    under5FeverLast2WeeksFemale: z.number().int().min(0).default(0),
    infant0to12mDeathsMale: z.number().int().min(0).default(0),
    infant0to12mDeathsFemale: z.number().int().min(0).default(0),
    infantTetanusDeathsMale: z.number().int().min(0).default(0),
    infantTetanusDeathsFemale: z.number().int().min(0).default(0),
    infantPneumoniaDeathsMale: z.number().int().min(0).default(0),
    infantPneumoniaDeathsFemale: z.number().int().min(0).default(0),
    infantDiarrheaDeathsMale: z.number().int().min(0).default(0),
    infantDiarrheaDeathsFemale: z.number().int().min(0).default(0),
    infantFeverDeathsMale: z.number().int().min(0).default(0),
    infantFeverDeathsFemale: z.number().int().min(0).default(0),
    infantOtherDeathsMale: z.number().int().min(0).default(0),
    infantOtherDeathsFemale: z.number().int().min(0).default(0),
    under5DeathsMale: z.number().int().min(0).default(0),
    under5DeathsFemale: z.number().int().min(0).default(0),
    under5PneumoniaDeathsMale: z.number().int().min(0).default(0),
    under5PneumoniaDeathsFemale: z.number().int().min(0).default(0),
    under5DiarrheaDeathsMale: z.number().int().min(0).default(0),
    under5DiarrheaDeathsFemale: z.number().int().min(0).default(0),
    under5FeverDeathsMale: z.number().int().min(0).default(0),
    under5FeverDeathsFemale: z.number().int().min(0).default(0),
    under5OtherDeathsMale: z.number().int().min(0).default(0),
    under5OtherDeathsFemale: z.number().int().min(0).default(0),
  }).optional(),

  vaccinationInfo: z.object({
    infant0to1HasCard: z.number().int().min(0).default(0),
    infant0to1Penta1: z.number().int().min(0).default(0),
    infant0to1Penta2: z.number().int().min(0).default(0),
    infant0to1Penta3: z.number().int().min(0).default(0),
    infant0to1BCG: z.number().int().min(0).default(0),
    infant0to1Measles: z.number().int().min(0).default(0),
    child1to5HasCard: z.number().int().min(0).default(0),
    child1to5Penta1: z.number().int().min(0).default(0),
    child1to5Penta2: z.number().int().min(0).default(0),
    child1to5Penta3: z.number().int().min(0).default(0),
    child1to5BCG: z.number().int().min(0).default(0),
    child1to5Measles: z.number().int().min(0).default(0),
  }).optional(),

  reproductiveHealth: z.object({
    pregnantCount: z.number().int().min(0).default(0),
    pregnantTrimester1: z.number().int().min(0).default(0),
    pregnantTrimester2: z.number().int().min(0).default(0),
    pregnantTrimester3: z.number().int().min(0).default(0),
    pregnantFollowedByHealthWorker: z.number().int().min(0).default(0),
    pregnantTetanusTotal: z.number().int().min(0).default(0),
    pregnantTetanusDose1: z.number().int().min(0).default(0),
    pregnantTetanusDose2: z.number().int().min(0).default(0),
    pregnantTetanusDose3: z.number().int().min(0).default(0),
    birthSpacingUnder1Year: z.number().int().min(0).default(0),
    birthSpacing1to2Years: z.number().int().min(0).default(0),
    birthSpacingOver2Years: z.number().int().min(0).default(0),
    deliveriesLastYear: z.number().int().min(0).default(0),
    deliveriesByTrainedStaff: z.number().int().min(0).default(0),
    deliveriesByUntrainedStaff: z.number().int().min(0).default(0),
    postnatalVisitsByTrainedStaff: z.number().int().min(0).default(0),
    maternalDeathsPregnancy: z.number().int().min(0).default(0),
    maternalDeathsBirth: z.number().int().min(0).default(0),
    maternalDeathsPostpartum: z.number().int().min(0).default(0),
    familyPlanningUsers: z.number().int().min(0).default(0),
  }).optional(),

  developmentalAssets: z.object({
    incomeProject: z.number().int().min(0).default(0),
    canteen: z.number().int().min(0).default(0),
    livestock: z.number().int().min(0).default(0),
    mill: z.number().int().min(0).default(0),
    oven: z.number().int().min(0).default(0),
    poultry: z.number().int().min(0).default(0),
    cart: z.number().int().min(0).default(0),
    farm: z.number().int().min(0).default(0),
    vehicle: z.number().int().min(0).default(0),
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
  }).optional(),
});

const HOUSEHOLD_INCLUDE = {
  village: { include: { locality: true } },
  collectedBy: { select: { id: true, name: true, username: true } },
  demographicInfo: true,
  educationInfo: true,
  waterInfo: true,
  housingInfo: true,
  agricultureInfo: true,
  livestockInfo: true,
  childHealthInfo: true,
  vaccinationInfo: true,
  reproductiveHealth: true,
  developmentalAssets: true,
  generalInfo: true,
  certificate: true,
};

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { villageId, localityId, collectedById, dateFrom, dateTo, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};
    if (req.user!.role === 'COLLECTOR') where.collectedById = req.user!.userId;
    if (collectedById && req.user!.role === 'ADMIN') where.collectedById = collectedById as string;
    if (villageId) where.villageId = villageId as string;
    if (localityId) where.village = { localityId: localityId as string };
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
          village: { include: { locality: true } },
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
        villageId: data.villageId,
        collectedById: req.user!.userId,
        ...(data.demographicInfo && { demographicInfo: { create: data.demographicInfo } }),
        ...(data.educationInfo && { educationInfo: { create: data.educationInfo } }),
        ...(data.waterInfo && { waterInfo: { create: data.waterInfo } }),
        ...(data.housingInfo && { housingInfo: { create: data.housingInfo } }),
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

    const household = await prisma.household.update({
      where: { id: householdId },
      data: {
        headOfFamilyName: data.headOfFamilyName,
        address: data.address,
        geoLat: data.geoLat,
        geoLng: data.geoLng,
        surveyDate: data.surveyDate ? new Date(data.surveyDate) : undefined,
        villageId: data.villageId,
        demographicInfo: upsertRelation(data.demographicInfo, householdId),
        educationInfo: upsertRelation(data.educationInfo, householdId),
        waterInfo: upsertRelation(data.waterInfo, householdId),
        housingInfo: upsertRelation(data.housingInfo, householdId),
        agricultureInfo: upsertRelation(data.agricultureInfo, householdId),
        livestockInfo: upsertRelation(data.livestockInfo, householdId),
        childHealthInfo: upsertRelation(data.childHealthInfo, householdId),
        vaccinationInfo: upsertRelation(data.vaccinationInfo, householdId),
        reproductiveHealth: upsertRelation(data.reproductiveHealth, householdId),
        developmentalAssets: upsertRelation(data.developmentalAssets, householdId),
        generalInfo: upsertRelation(data.generalInfo, householdId),
      },
      include: HOUSEHOLD_INCLUDE,
    });

    res.json(household);
  } catch (err) {
    next(err);
  }
});

export default router;
