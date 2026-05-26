import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { buildScopeWhere } from '../lib/scopeFilter';
import * as XLSX from 'xlsx';

const router = Router();
router.use(authenticate, requireRole('ADMIN', 'LOCALITY_MANAGER', 'ADMIN_UNIT_MANAGER', 'VILLAGE_MANAGER', 'NEIGHBORHOOD_MANAGER'));

const NEIGHBORHOOD_INCLUDE = {
  neighborhood: {
    include: {
      village: {
        include: { administrativeUnit: { include: { locality: true } } },
      },
    },
  },
} as const;

function buildWhere(q: Record<string, string>, user: { role: string; scopeLocalityId?: string; scopeAdminUnitId?: string; scopeVillageId?: string; scopeNeighborhoodId?: string }) {
  const where: Record<string, unknown> = buildScopeWhere(user as Parameters<typeof buildScopeWhere>[0]);

  if (q.localityId) {
    where.neighborhood = { village: { administrativeUnit: { localityId: q.localityId } } };
  }
  if (q.administrativeUnitId) {
    where.neighborhood = { village: { administrativeUnitId: q.administrativeUnitId } };
  }
  if (q.villageId) {
    where.neighborhood = { villageId: q.villageId };
  }
  if (q.neighborhoodId) {
    where.neighborhoodId = q.neighborhoodId;
  }
  if (q.collectedById) where.collectedById = q.collectedById;

  if (q.dateFrom || q.dateTo) {
    where.surveyDate = {
      ...(q.dateFrom ? { gte: new Date(q.dateFrom) } : {}),
      ...(q.dateTo ? { lte: new Date(q.dateTo) } : {}),
    };
  }

  const gi = (where.generalInfo as Record<string, unknown>) || {};
  if (q.isMigrant !== undefined) gi.isMigrant = q.isMigrant === 'true';
  if (q.hasChronicCondition !== undefined) gi.hasChronicCondition = q.hasChronicCondition === 'true';
  if (q.hasDisability !== undefined) gi.hasDisability = q.hasDisability === 'true';
  if (q.hasCancer !== undefined) gi.hasCancer = q.hasCancer === 'true';
  if (q.hasHealthInsurance !== undefined) gi.hasHealthInsurance = q.hasHealthInsurance === 'true';
  if (q.homeStatus) gi.homeStatus = q.homeStatus;
  if (q.insuranceProvider) gi.insuranceProvider = q.insuranceProvider;
  if (Object.keys(gi).length) where.generalInfo = gi;

  return where;
}

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query as Record<string, string>;
    const where = buildWhere(q, req.user!);

    const [totalHouseholds, households] = await Promise.all([
      prisma.household.count({ where }),
      prisma.household.findMany({
        where,
        include: {
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
          ...NEIGHBORHOOD_INCLUDE,
          collectedBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    function sumField<T>(arr: (T | null)[], field: keyof T): number {
      return arr.reduce((acc, item) => acc + (item ? Number(item[field]) || 0 : 0), 0);
    }

    const demographics = households.map((h) => h.demographicInfo);
    const education = households.map((h) => h.educationInfo);
    const water = households.map((h) => h.waterInfo);
    const housing = households.map((h) => h.housingInfo);
    const agriculture = households.map((h) => h.agricultureInfo);
    const livestock = households.map((h) => h.livestockInfo);
    const childHealth = households.map((h) => h.childHealthInfo);
    const vaccination = households.map((h) => h.vaccinationInfo);
    const reproductive = households.map((h) => h.reproductiveHealth);
    const assets = households.map((h) => h.developmentalAssets);
    const general = households.map((h) => h.generalInfo);

    const byVillage: Record<string, { name: string; locality: string; count: number }> = {};
    for (const h of households) {
      const village = h.neighborhood.village;
      const vid = village.id;
      if (!byVillage[vid]) {
        byVillage[vid] = {
          name: village.name,
          locality: village.administrativeUnit.locality.name,
          count: 0,
        };
      }
      byVillage[vid].count++;
    }

    res.json({
      totalHouseholds,
      demographics: {
        totalPopulationMale: sumField(demographics, 'totalPopulationMale'),
        totalPopulationFemale: sumField(demographics, 'totalPopulationFemale'),
        householdCount: sumField(demographics, 'householdCount'),
        totalFamilyMembers: sumField(demographics, 'totalFamilyMembers'),
        childrenUnder5: sumField(demographics, 'childrenUnder5Male') + sumField(demographics, 'childrenUnder5Female'),
        womenReproductive: sumField(demographics, 'womenReproductive15to49'),
        elderlyOver70: sumField(demographics, 'elderlyOver70Male') + sumField(demographics, 'elderlyOver70Female'),
        marriedWomen: sumField(demographics, 'marriedWomen'),
        divorcedWidowedWomen: sumField(demographics, 'divorcedWidowedWomen'),
      },
      education: {
        children4to6: sumField(education, 'children4to6'),
        enrolled: sumField(education, 'children4to6Enrolled'),
        notEnrolled: sumField(education, 'children4to6NotEnrolled'),
        dropouts: sumField(education, 'dropoutsLastYear'),
        illiterateMale: sumField(education, 'illiterateMale'),
        illiterateFemale: sumField(education, 'illiterateFemale'),
      },
      water: {
        publicNetwork: sumField(water, 'publicNetwork'),
        indoorTank: sumField(water, 'indoorTank'),
        outdoorTank: sumField(water, 'outdoorTank'),
        hafir: sumField(water, 'hafir'),
        well: sumField(water, 'well'),
        otherSource: sumField(water, 'otherSource'),
        hasEnoughWater: sumField(water, 'hasEnoughWater'),
      },
      housing: {
        noToilet: sumField(housing, 'noToilet'),
        basicPit: sumField(housing, 'basicPitToilet'),
        improvedPit: sumField(housing, 'improvedPitToilet'),
        siphon: sumField(housing, 'siphonToilet'),
        other: sumField(housing, 'otherToilet'),
        properWasteDisposal: sumField(housing, 'properWasteDisposal'),
      },
      agriculture: {
        ownsLand: sumField(agriculture, 'ownsAgriculturalLand'),
        cultivates: sumField(agriculture, 'cultivatesLand'),
        pumpIrrigation: sumField(agriculture, 'pumpIrrigation'),
        solarIrrigation: sumField(agriculture, 'solarIrrigation'),
        usesTechnicalExperts: sumField(agriculture, 'usesTechnicalExperts'),
      },
      livestock: {
        raisesLivestock: sumField(livestock, 'raisesLivestock'),
        cattle: sumField(livestock, 'cattle'),
        sheep: sumField(livestock, 'sheep'),
        goats: sumField(livestock, 'goats'),
        camels: sumField(livestock, 'camels'),
        raisesPoultry: sumField(livestock, 'raisesPoultry'),
        chicken: sumField(livestock, 'chicken'),
        pigeon: sumField(livestock, 'pigeon'),
      },
      childHealth: {
        birthsLastYear: sumField(childHealth, 'birthsLastYearMale') + sumField(childHealth, 'birthsLastYearFemale'),
        liveBirths: sumField(childHealth, 'liveBirthsMale') + sumField(childHealth, 'liveBirthsFemale'),
        stillBirths: sumField(childHealth, 'stillBirthsMale') + sumField(childHealth, 'stillBirthsFemale'),
        infantDeaths: sumField(childHealth, 'infant0to12mDeathsMale') + sumField(childHealth, 'infant0to12mDeathsFemale'),
        under5Deaths: sumField(childHealth, 'under5DeathsMale') + sumField(childHealth, 'under5DeathsFemale'),
        under5Ill: sumField(childHealth, 'under5IllLast2WeeksMale') + sumField(childHealth, 'under5IllLast2WeeksFemale'),
      },
      vaccination: {
        infant0to1HasCard: sumField(vaccination, 'infant0to1HasCard'),
        infant0to1Penta3: sumField(vaccination, 'infant0to1Penta3'),
        infant0to1BCG: sumField(vaccination, 'infant0to1BCG'),
        infant0to1Measles: sumField(vaccination, 'infant0to1Measles'),
        child1to5HasCard: sumField(vaccination, 'child1to5HasCard'),
      },
      reproductiveHealth: {
        pregnantCount: sumField(reproductive, 'pregnantCount'),
        deliveriesLastYear: sumField(reproductive, 'deliveriesLastYear'),
        deliveriesByTrainedStaff: sumField(reproductive, 'deliveriesByTrainedStaff'),
        maternalDeaths: sumField(reproductive, 'maternalDeathsPregnancy') + sumField(reproductive, 'maternalDeathsBirth') + sumField(reproductive, 'maternalDeathsPostpartum'),
        familyPlanningUsers: sumField(reproductive, 'familyPlanningUsers'),
      },
      developmentalAssets: {
        incomeProject: sumField(assets, 'incomeProject'),
        canteen: sumField(assets, 'canteen'),
        mill: sumField(assets, 'mill'),
        oven: sumField(assets, 'oven'),
        vehicle: sumField(assets, 'vehicle'),
      },
      generalInfo: {
        migrantCount: general.filter((g) => g?.isMigrant).length,
        beforeWarCount: general.filter((g) => g?.migrationTiming === 'BEFORE_WAR').length,
        afterWarCount: general.filter((g) => g?.migrationTiming === 'AFTER_WAR').length,
        chronicCount: general.filter((g) => g?.hasChronicCondition).length,
        disabilityCount: general.filter((g) => g?.hasDisability).length,
        cancerCount: general.filter((g) => g?.hasCancer).length,
        insuredCount: general.filter((g) => g?.hasHealthInsurance).length,
        ownedCount: general.filter((g) => g?.homeStatus === 'OWNED').length,
        rentedCount: general.filter((g) => g?.homeStatus === 'RENTED').length,
        supportCount: general.filter((g) => g?.receivesSupport).length,
      },
      byVillage: Object.values(byVillage),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/households', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query as Record<string, string>;
    const where = buildWhere(q, req.user!);
    const { page = '1', limit = '50' } = q;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, households] = await Promise.all([
      prisma.household.count({ where }),
      prisma.household.findMany({
        where,
        include: {
          ...NEIGHBORHOOD_INCLUDE,
          collectedBy: { select: { id: true, name: true } },
          generalInfo: true,
          waterInfo: true,
          housingInfo: true,
          demographicInfo: true,
        },
        orderBy: { surveyDate: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);

    res.json({ data: households, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
});

router.get('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query as Record<string, string>;
    const where = buildWhere(q, req.user!);

    const households = await prisma.household.findMany({
      where,
      include: {
        ...NEIGHBORHOOD_INCLUDE,
        collectedBy: { select: { name: true } },
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
      },
      orderBy: { surveyDate: 'desc' },
    });

    const rows = households.map((h) => {
      const village = h.neighborhood.village;
      const locality = village.administrativeUnit.locality;
      return {
        'المحلية': locality.name,
        'الوحدة الإدارية': village.administrativeUnit.name,
        'القرية': village.name,
        'الحي': h.neighborhood.name,
        'رب الأسرة': h.headOfFamilyName,
        'تاريخ المسح': h.surveyDate.toLocaleDateString('ar-SA'),
        'جامع البيانات': h.collectedBy.name,
        'العدد الكلي للأسرة': h.demographicInfo?.totalFamilyMembers ?? 0,
        'إجمالي السكان (ذكور)': h.demographicInfo?.totalPopulationMale ?? 0,
        'إجمالي السكان (إناث)': h.demographicInfo?.totalPopulationFemale ?? 0,
        'مصدر المياه - شبكة عامة': h.waterInfo?.publicNetwork ?? 0,
        'مصدر المياه - بئر': h.waterInfo?.well ?? 0,
        'نوع السكن': h.housingInfo?.housingType ?? '-',
        'نوع الملكية': h.housingInfo?.ownershipType ?? '-',
        'مرحاض - حفرة عادية': h.housingInfo?.basicPitToilet ?? 0,
        'وافد': h.generalInfo?.isMigrant ? 'نعم' : 'لا',
        'وضع السكن': h.generalInfo?.homeStatus === 'OWNED' ? 'ملك' : h.generalInfo?.homeStatus === 'RENTED' ? 'مستأجر' : '-',
        'مرض مزمن': h.generalInfo?.hasChronicCondition ? 'نعم' : 'لا',
        'إعاقة': h.generalInfo?.hasDisability ? 'نعم' : 'لا',
        'تأمين صحي': h.generalInfo?.hasHealthInsurance ? 'نعم' : 'لا',
        'دعم منتظم': h.generalInfo?.receivesSupport ? 'نعم' : 'لا',
        'عدد الحوامل': h.reproductiveHealth?.pregnantCount ?? 0,
        'الولادات العام الماضي': h.reproductiveHealth?.deliveriesLastYear ?? 0,
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'البيانات');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="household-report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    next(err);
  }
});

export default router;
