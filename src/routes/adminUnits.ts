import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const adminUnitSchema = z.object({
  name: z.string().min(1, 'اسم الوحدة الإدارية مطلوب'),
  localityId: z.string().min(1, 'المحلية مطلوبة'),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { localityId } = req.query;
    const adminUnits = await prisma.administrativeUnit.findMany({
      where: localityId ? { localityId: localityId as string } : undefined,
      include: { locality: true },
      orderBy: { name: 'asc' },
    });
    res.json(adminUnits);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = adminUnitSchema.parse(req.body);
    const unit = await prisma.administrativeUnit.create({
      data,
      include: { locality: true },
    });
    res.status(201).json(unit);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = adminUnitSchema.parse(req.body);
    const unit = await prisma.administrativeUnit.update({
      where: { id: req.params.id as string },
      data,
      include: { locality: true },
    });
    res.json(unit);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.administrativeUnit.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'تم حذف الوحدة الإدارية بنجاح' });
  } catch (err) {
    next(err);
  }
});

export default router;
