import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const localitySchema = z.object({
  name: z.string().min(1, 'اسم المحلية مطلوب'),
});

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const localities = await prisma.locality.findMany({
      include: { adminUnits: true },
      orderBy: { name: 'asc' },
    });
    res.json(localities);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = localitySchema.parse(req.body);
    const locality = await prisma.locality.create({ data: { name } });
    res.status(201).json(locality);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = localitySchema.parse(req.body);
    const locality = await prisma.locality.update({ where: { id: req.params.id as string }, data: { name } });
    res.json(locality);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.locality.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'تم حذف المحلية بنجاح' });
  } catch (err) {
    next(err);
  }
});

export default router;
