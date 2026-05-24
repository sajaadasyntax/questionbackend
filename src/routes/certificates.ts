import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import puppeteer from 'puppeteer';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { generateCertificateHtml } from '../templates/certificate';

const router = Router();
router.use(authenticate);

const certificateSchema = z.object({
  committeeArea: z.string().optional(),
  boundaryNorth: z.string().optional(),
  boundarySouth: z.string().optional(),
  boundaryEast: z.string().optional(),
  boundaryWest: z.string().optional(),
  areaSqm: z.number().optional().nullable(),
});

router.post('/:id/certificate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = certificateSchema.parse(req.body);

    const householdId = req.params.id as string;
    const where: Record<string, unknown> = { id: householdId };
    if (req.user!.role === 'COLLECTOR') where.collectedById = req.user!.userId;

    const household = await prisma.household.findFirst({
      where,
      include: { village: { include: { locality: true } }, certificate: true },
    });

    if (!household) {
      res.status(404).json({ message: 'الأسرة غير موجودة' });
      return;
    }

    const certificate = await prisma.residenceCertificate.upsert({
      where: { householdId },
      update: {
        committeeArea: data.committeeArea,
        boundaryNorth: data.boundaryNorth,
        boundarySouth: data.boundarySouth,
        boundaryEast: data.boundaryEast,
        boundaryWest: data.boundaryWest,
        areaSqm: data.areaSqm ?? null,
        issuedById: req.user!.userId,
        issuedDate: new Date(),
      },
      create: {
        householdId,
        committeeArea: data.committeeArea,
        boundaryNorth: data.boundaryNorth,
        boundarySouth: data.boundarySouth,
        boundaryEast: data.boundaryEast,
        boundaryWest: data.boundaryWest,
        areaSqm: data.areaSqm ?? null,
        issuedById: req.user!.userId,
      },
    });

    res.json(certificate);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/certificate.pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const householdId = req.params.id as string;
    const where: Record<string, unknown> = { id: householdId };
    if (req.user!.role === 'COLLECTOR') where.collectedById = req.user!.userId;

    const household = await prisma.household.findFirst({
      where,
      include: {
        village: { include: { locality: true } },
        certificate: true,
      },
    });

    if (!household) {
      res.status(404).json({ message: 'الأسرة غير موجودة' });
      return;
    }

    if (!household.certificate) {
      res.status(404).json({ message: 'لم يتم إصدار شهادة سكن لهذه الأسرة بعد' });
      return;
    }

    const cert = household.certificate;
    const html = generateCertificateHtml({
      committeeArea: cert.committeeArea || household.village.name,
      headOfFamilyName: household.headOfFamilyName,
      village: household.village.name,
      locality: household.village.locality.name,
      boundaryNorth: cert.boundaryNorth || '',
      boundarySouth: cert.boundarySouth || '',
      boundaryEast: cert.boundaryEast || '',
      boundaryWest: cert.boundaryWest || '',
      areaSqm: cert.areaSqm,
      issuedDate: cert.issuedDate.toLocaleDateString('ar-SA'),
      certificateNumber: cert.certificateNumber,
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A5',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${household.headOfFamilyName}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
