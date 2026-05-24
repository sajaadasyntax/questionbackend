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

  const village = await prisma.village.upsert({
    where: { name_localityId: { name: 'قرية كنور قبلي', localityId: locality.id } },
    update: {},
    create: { name: 'قرية كنور قبلي', localityId: locality.id },
  });
  console.log(`✅ تم إنشاء القرية: ${village.name}`);

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
