import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Создание филиала с branchId = 1, если он еще не существует
  const branch = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1, // Можно убрать если не хотите явно указывать ID, тогда будет autoincrement
      name: 'Главный филиал',
      address: 'Адрес филиала',
    },
  });

  // Создание дефолтного пользователя
  const user = await prisma.user.upsert({
    where: { phone: '998770421939' },
    update: {},
    create: {
      phone: '998770421939',
      fio: 'admin',
      salary: 0,
      role: ['CEO'],
    },
  });

  // Привязка пользователя к филиалу с branchId = 1
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: user.id,
        branchId: branch.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      branchId: branch.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
