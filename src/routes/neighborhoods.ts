import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const neighborhoodSchema = z.object({
  name: z.string().min(1, 'اسم الحي مطلوب'),
  villageId: z.string().min(1, 'القرية مطلوبة'),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { villageId } = req.query;
    const neighborhoods = await prisma.neighborhood.findMany({
      where: villageId ? { villageId: villageId as string } : undefined,
      include: { village: { include: { administrativeUnit: { include: { locality: true } } } } },
      orderBy: { name: 'asc' },
    });
    res.json(neighborhoods);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = neighborhoodSchema.parse(req.body);
    const neighborhood = await prisma.neighborhood.create({
      data,
      include: { village: true },
    });
    res.status(201).json(neighborhood);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = neighborhoodSchema.parse(req.body);
    const neighborhood = await prisma.neighborhood.update({
      where: { id: req.params.id as string },
      data,
      include: { village: true },
    });
    res.json(neighborhood);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.neighborhood.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'تم حذف الحي بنجاح' });
  } catch (err) {
    next(err);
  }
});

export default router;
