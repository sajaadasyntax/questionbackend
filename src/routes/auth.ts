import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.isActive) {
      res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        username: user.username,
        scopeLocalityId: user.scopeLocalityId ?? undefined,
        scopeAdminUnitId: user.scopeAdminUnitId ?? undefined,
        scopeVillageId: user.scopeVillageId ?? undefined,
        scopeNeighborhoodId: user.scopeNeighborhoodId ?? undefined,
      },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as unknown as number }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, username: true, role: true, isActive: true },
    });
    if (!user) {
      res.status(404).json({ message: 'المستخدم غير موجود' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
