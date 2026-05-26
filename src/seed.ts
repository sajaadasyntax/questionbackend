import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات...');

  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'مدير النظام',
      username: 'admin',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ تم إنشاء المستخدم الإداري: ${admin.username}`);

  const collectorHash = await bcrypt.hash('Collector@1234', 12);
  const collector = await prisma.user.upsert({
    where: { username: 'collector1' },
    update: {},
    create: {
      name: 'جامع البيانات الأول',
      username: 'collector1',
      passwordHash: collectorHash,
      role: 'COLLECTOR',
    },
  });
  console.log(`✅ تم إنشاء جامع البيانات: ${collector.username}`);

  const locality = await prisma.locality.upsert({
    where: { name: 'المحلية الأولى' },
    update: {},
    create: { name: 'المحلية الأولى' },
  });
  console.log(`✅ تم إنشاء المحلية: ${locality.name}`);

  const adminUnit = await prisma.administrativeUnit.upsert({
    where: { name_localityId: { name: 'الوحدة الافتراضية', localityId: locality.id } },
    update: {},
    create: { name: 'الوحدة الافتراضية', localityId: locality.id },
  });
  console.log(`✅ تم إنشاء الوحدة الإدارية: ${adminUnit.name}`);

  const village = await prisma.village.upsert({
    where: { name_administrativeUnitId: { name: 'قرية كنور قبلي', administrativeUnitId: adminUnit.id } },
    update: {},
    create: { name: 'قرية كنور قبلي', administrativeUnitId: adminUnit.id },
  });
  console.log(`✅ تم إنشاء القرية: ${village.name}`);

  const neighborhood = await prisma.neighborhood.upsert({
    where: { name_villageId: { name: 'الحي الرئيسي', villageId: village.id } },
    update: {},
    create: { name: 'الحي الرئيسي', villageId: village.id },
  });
  console.log(`✅ تم إنشاء الحي: ${neighborhood.name}`);

  console.log('\n✅ تمت تهيئة قاعدة البيانات بنجاح!');
  console.log('بيانات الدخول:');
  console.log('  المدير:      admin / Admin@1234');
  console.log('  جامع البيانات: collector1 / Collector@1234');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
