import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  role: Role;
  username: string;
  scopeLocalityId?: string;
  scopeAdminUnitId?: string;
  scopeVillageId?: string;
  scopeNeighborhoodId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'غير مصرح بالدخول' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'الجلسة منتهية، يرجى تسجيل الدخول مجدداً' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'غير مصرح بالدخول' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'ليس لديك صلاحية الوصول لهذه الصفحة' });
      return;
    }
    next();
  };
}
