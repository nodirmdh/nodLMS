import { NotificationChannel, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TEMPLATES: Array<{
  code: string;
  channel: NotificationChannel;
  locale: string;
  subject?: string;
  body: string;
}> = [
  {
    code: 'auth.otp',
    channel: 'sms',
    locale: 'ru',
    body: 'RUSTAMBEK.lmsnet.uz saytina kiriw ushin kodi-{{ code }}',
  },
  {
    code: 'debt.reminder',
    channel: 'sms',
    locale: 'ru',
    body:
      "Eskertiw! Hu'rmetli ata-ana, RUSTAMBEK OQIW ORAYInda oquwshi perzentin'iz {{ student.fio }} {{ amount }} swm qarizdarlig'i bar! tel: 941235151",
  },
  {
    code: 'payment.confirmed',
    channel: 'sms',
    locale: 'ru',
    body:
      "Assalawma A'leykum! Perzentin'iz {{ student.fio }} {{ date }} sa'nesinde {{ amount }} swm to'lem qabillandi. Raxmet!",
  },
  {
    code: 'payment.confirmed',
    channel: 'telegram',
    locale: 'ru',
    body:
      'Оплата принята: {{ student.fio }} — {{ amount }} сум ({{ date }}). Спасибо!',
  },
  {
    code: 'lesson.reminder',
    channel: 'telegram',
    locale: 'ru',
    body:
      'Через час начинается урок группы {{ group.name }} в {{ startTime }}. Не опаздывайте.',
  },
];

async function seedTemplates() {
  for (const tpl of DEFAULT_TEMPLATES) {
    await prisma.notificationTemplate.upsert({
      where: {
        code_channel_locale: {
          code: tpl.code,
          channel: tpl.channel,
          locale: tpl.locale,
        },
      },
      update: {
        subject: tpl.subject ?? null,
        body: tpl.body,
        enabled: true,
      },
      create: {
        code: tpl.code,
        channel: tpl.channel,
        locale: tpl.locale,
        subject: tpl.subject ?? null,
        body: tpl.body,
        enabled: true,
      },
    });
  }
  console.log(`Seeded ${DEFAULT_TEMPLATES.length} notification templates.`);
}

async function main() {
  const branch = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Главный филиал',
      address: 'Адрес филиала',
    },
  });

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

  await seedTemplates();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
