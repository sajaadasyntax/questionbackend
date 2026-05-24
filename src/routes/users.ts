import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireRole('ADMIN'));

const createUserSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  role: z.enum(['ADMIN', 'COLLECTOR']).default('COLLECTOR'),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
  role: z.enum(['ADMIN', 'COLLECTOR']).optional(),
});

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, username: true, role: true,
        isActive: true, createdAt: true,
        _count: { select: { households: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { name: data.name, username: data.username, passwordHash, role: data.role },
      select: { id: true, name: true, username: true, role: true, isActive: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.role) updateData.role = data.role;
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: updateData,
      select: { id: true, name: true, username: true, role: true, isActive: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id as string },
      data: { isActive: false },
    });
    res.json({ message: 'تم تعطيل المستخدم بنجاح' });
  } catch (err) {
    next(err);
  }
});

export default router;
