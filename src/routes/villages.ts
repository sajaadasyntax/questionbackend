import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const villageSchema = z.object({
  name: z.string().min(1, 'اسم القرية مطلوب'),
  administrativeUnitId: z.string().min(1, 'الوحدة الإدارية مطلوبة'),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { administrativeUnitId, localityId } = req.query;
    const where: Record<string, unknown> = {};
    if (administrativeUnitId) where.administrativeUnitId = administrativeUnitId as string;
    if (localityId) where.administrativeUnit = { localityId: localityId as string };

    const villages = await prisma.village.findMany({
      where,
      include: { administrativeUnit: { include: { locality: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(villages);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = villageSchema.parse(req.body);
    const village = await prisma.village.create({
      data,
      include: { administrativeUnit: { include: { locality: true } } },
    });
    res.status(201).json(village);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = villageSchema.parse(req.body);
    const village = await prisma.village.update({
      where: { id: req.params.id as string },
      data,
      include: { administrativeUnit: { include: { locality: true } } },
    });
    res.json(village);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.village.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'تم حذف القرية بنجاح' });
  } catch (err) {
    next(err);
  }
});

export default router;
