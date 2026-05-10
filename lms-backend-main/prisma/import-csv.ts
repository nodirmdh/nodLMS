import { PrismaClient } from '@prisma/client';
const csv = require('csv-parser');
const { createReadStream } = require('fs');
const { join } = require('path');

const prisma = new PrismaClient();

interface StudentData {
  fio: string;
  balance?: number;
  phone: string;
  sex?: string;
  telegram?: string;
  birthday: string;
  pinfl?: string;
  status?: string;
  fatherFio?: string;
  fatherPhone?: string;
  fatherJob?: string;
  montherFio?: string;
  montherPhone?: string;
  montherJob?: string;
  disability?: boolean;
  groupId: number;
  courseId: number; // Поле courseId
}

const filePath = join(__dirname, '../1b.csv');

async function importStudents() {
  const students: StudentData[] = [];

  // Чтение CSV файла
  createReadStream(filePath)
    .pipe(csv())
    .on('data', (row: StudentData) => {
      students.push({
        fio: row.fio,
        balance: row.balance ? parseFloat(row.balance.toString()) : 0,
        phone: row.phone,
        sex: row.sex || null,
        telegram: row.telegram || null,
        birthday: row.birthday,
        pinfl: row.pinfl || null,
        status: row.status || 'active',
        fatherFio: row.fatherFio || null,
        fatherPhone: row.fatherPhone || null,
        fatherJob: row.fatherJob || null,
        montherFio: row.montherFio || null,
        montherPhone: row.montherPhone || null,
        montherJob: row.montherJob || null,
        disability: row.disability ? true : false,
        groupId: Number(row.groupId),
        courseId: Number(row.courseId),
      });
    })
    .on('end', async () => {
      console.log(`Импортировано ${students.length} студентов`);

      try {
        for (const student of students) {
          // Используем транзакции для атомарности
          await prisma.$transaction(async (prisma) => {
            // Проверка существования группы
            const group = await prisma.group.findUnique({
              where: { id: student.groupId },
            });

            // Проверка существования курса
            const course = await prisma.course.findUnique({
              where: { id: student.courseId },
            });

            if (!group) {
              console.error(`Группа с id ${student.groupId} не найдена`);
              throw new Error(`Пропускаем студента, если группа не найдена`);
            }

            if (!course) {
              console.error(`Курс с id ${student.courseId} не найден`);
              throw new Error(`Пропускаем студента, если курс не найден`);
            }

            // Создание студента
            const createdStudent = await prisma.student.create({
              data: {
                fio: student.fio,
                balance: student.balance,
                phone: student.phone,
                sex: student.sex,
                telegram: student.telegram,
                birthday: student.birthday,
                pinfl: student.pinfl,
                status: student.status as any,
                fatherFio: student.fatherFio,
                fatherPhone: student.fatherPhone,
                fatherJob: student.fatherJob,
                montherFio: student.montherFio,
                montherPhone: student.montherPhone,
                montherJob: student.montherJob,
                disability: student.disability,
              },
            });

            // Добавляем студента в группу (GroupStudent)
            await prisma.groupStudent.create({
              data: {
                studentId: createdStudent.id,
                groupId: student.groupId,
              },
            });

            // Обновляем курс, добавляя студента в курс
            await prisma.course.update({
              where: { id: student.courseId },
              data: {
                students: {
                  connect: { id: createdStudent.id },
                },
              },
            });

            console.log(
              `Студент ${student.fio} успешно импортирован и добавлен в группу и курс`,
            );
          });
        }
      } catch (error) {
        console.error('Ошибка при импорте:', error);
      } finally {
        await prisma.$disconnect();
      }
    });
}

importStudents();
