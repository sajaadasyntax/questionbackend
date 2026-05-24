import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import * as XLSX from 'xlsx';

const router = Router();
router.use(authenticate, requireRole('ADMIN'));

function buildWhere(q: Record<string, string>) {
  const where: Record<string, unknown> = {};

  if (q.localityId) where.village = { localityId: q.localityId };
  if (q.villageId) where.villageId = q.villageId;
  if (q.collectedById) where.collectedById = q.collectedById;

  if (q.dateFrom || q.dateTo) {
    where.surveyDate = {
      ...(q.dateFrom ? { gte: new Date(q.dateFrom) } : {}),
      ...(q.dateTo ? { lte: new Date(q.dateTo) } : {}),
    };
  }

  if (q.isMigrant !== undefined) {
    where.generalInfo = {
      ...((where.generalInfo as object) || {}),
      isMigrant: q.isMigrant === 'true',
    };
  }
  if (q.hasChronicCondition !== undefined) {
    where.generalInfo = {
      ...((where.generalInfo as object) || {}),
      hasChronicCondition: q.hasChronicCondition === 'true',
    };
  }
  if (q.hasDisability !== undefined) {
    where.generalInfo = {
      ...((where.generalInfo as object) || {}),
      hasDisability: q.hasDisability === 'true',
    };
  }
  if (q.hasCancer !== undefined) {
    where.generalInfo = {
      ...((where.generalInfo as object) || {}),
      hasCancer: q.hasCancer === 'true',
    };
  }
  if (q.hasHealthInsurance !== undefined) {
    where.generalInfo = {
      ...((where.generalInfo as object) || {}),
      hasHealthInsurance: q.hasHealthInsurance === 'true',
    };
  }
  if (q.homeStatus) {
    where.generalInfo = {
      ...((where.generalInfo as object) || {}),
      homeStatus: q.homeStatus,
    };
  }
  if (q.insuranceProvider) {
    where.generalInfo = {
      ...((where.generalInfo as object) || {}),
      insuranceProvider: q.insuranceProvider,
    };
  }

  return where;
}

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query as Record<string, string>;
    const where = buildWhere(q);

    const [
      totalHouseholds,
      households,
    ] = await Promise.all([
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
          village: { include: { locality: true } },
          collectedBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Aggregate numeric sums across all matching households
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

    // Village breakdown
    const byVillage: Record<string, { name: string; locality: string; count: number }> = {};
    for (const h of households) {
      const vid = h.villageId;
      if (!byVillage[vid]) {
        byVillage[vid] = {
          name: h.village.name,
          locality: h.village.locality.name,
          count: 0,
        };
      }
      byVillage[vid].count++;
    }

    // Water source breakdown
    const waterSources = {
      publicNetwork: sumField(water, 'publicNetwork'),
      indoorTank: sumField(water, 'indoorTank'),
      outdoorTank: sumField(water, 'outdoorTank'),
      hafir: sumField(water, 'hafir'),
      well: sumField(water, 'well'),
      otherSource: sumField(water, 'otherSource'),
      hasEnoughWater: sumField(water, 'hasEnoughWater'),
    };

    // Toilet type breakdown
    const toiletTypes = {
      noToilet: sumField(housing, 'noToilet'),
      basicPit: sumField(housing, 'basicPitToilet'),
      improvedPit: sumField(housing, 'improvedPitToilet'),
      siphon: sumField(housing, 'siphonToilet'),
      other: sumField(housing, 'otherToilet'),
    };

    // General info aggregates
    const migrantCount = general.filter((g) => g?.isMigrant).length;
    const beforeWarCount = general.filter((g) => g?.migrationTiming === 'BEFORE_WAR').length;
    const afterWarCount = general.filter((g) => g?.migrationTiming === 'AFTER_WAR').length;
    const chronicCount = general.filter((g) => g?.hasChronicCondition).length;
    const disabilityCount = general.filter((g) => g?.hasDisability).length;
    const cancerCount = general.filter((g) => g?.hasCancer).length;
    const insuredCount = general.filter((g) => g?.hasHealthInsurance).length;
    const ownedCount = general.filter((g) => g?.homeStatus === 'OWNED').length;
    const rentedCount = general.filter((g) => g?.homeStatus === 'RENTED').length;

    res.json({
      totalHouseholds,
      demographics: {
        totalPopulationMale: sumField(demographics, 'totalPopulationMale'),
        totalPopulationFemale: sumField(demographics, 'totalPopulationFemale'),
        householdCount: sumField(demographics, 'householdCount'),
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
      water: waterSources,
      housing: {
        ...toiletTypes,
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
        migrantCount,
        beforeWarCount,
        afterWarCount,
        chronicCount,
        disabilityCount,
        cancerCount,
        insuredCount,
        ownedCount,
        rentedCount,
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
    const where = buildWhere(q);
    const { page = '1', limit = '50' } = q;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, households] = await Promise.all([
      prisma.household.count({ where }),
      prisma.household.findMany({
        where,
        include: {
          village: { include: { locality: true } },
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
    const where = buildWhere(q);

    const households = await prisma.household.findMany({
      where,
      include: {
        village: { include: { locality: true } },
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

    const rows = households.map((h) => ({
      'المحلية': h.village.locality.name,
      'القرية': h.village.name,
      'رب الأسرة': h.headOfFamilyName,
      'تاريخ المسح': h.surveyDate.toLocaleDateString('ar-SA'),
      'جامع البيانات': h.collectedBy.name,
      'إجمالي السكان (ذكور)': h.demographicInfo?.totalPopulationMale ?? 0,
      'إجمالي السكان (إناث)': h.demographicInfo?.totalPopulationFemale ?? 0,
      'مصدر المياه - شبكة عامة': h.waterInfo?.publicNetwork ?? 0,
      'مصدر المياه - بئر': h.waterInfo?.well ?? 0,
      'مرحاض - حفرة عادية': h.housingInfo?.basicPitToilet ?? 0,
      'وافد': h.generalInfo?.isMigrant ? 'نعم' : 'لا',
      'وضع السكن': h.generalInfo?.homeStatus === 'OWNED' ? 'ملك' : h.generalInfo?.homeStatus === 'RENTED' ? 'مستأجر' : '-',
      'مرض مزمن': h.generalInfo?.hasChronicCondition ? 'نعم' : 'لا',
      'إعاقة': h.generalInfo?.hasDisability ? 'نعم' : 'لا',
      'تأمين صحي': h.generalInfo?.hasHealthInsurance ? 'نعم' : 'لا',
      'عدد الحوامل': h.reproductiveHealth?.pregnantCount ?? 0,
      'الولادات العام الماضي': h.reproductiveHealth?.deliveriesLastYear ?? 0,
    }));

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
