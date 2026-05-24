import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => e.message).join(', ');
    res.status(400).json({ message: `بيانات غير صحيحة: ${messages}`, errors: err.errors });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ message: 'هذا السجل موجود مسبقاً' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'السجل غير موجود' });
      return;
    }
  }

  if (err instanceof Error) {
    console.error(err);
    res.status(500).json({ message: err.message || 'خطأ في الخادم' });
    return;
  }

  res.status(500).json({ message: 'خطأ غير متوقع في الخادم' });
}
