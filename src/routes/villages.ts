import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const villageSchema = z.object({
  name: z.string().min(1, 'اسم القرية مطلوب'),
  localityId: z.string().min(1, 'المحلية مطلوبة'),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { localityId } = req.query;
    const villages = await prisma.village.findMany({
      where: localityId ? { localityId: localityId as string } : undefined,
      include: { locality: true },
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
      include: { locality: true },
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
      include: { locality: true },
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
