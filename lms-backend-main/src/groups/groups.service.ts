import { BadRequestException, Injectable } from '@nestjs/common';
import { Group, GroupStatus, Student, User } from '@prisma/client';
import { LessonsService } from 'src/lessons/lessons.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    private lessonsService: LessonsService,
  ) {}

  async create(data: Group): Promise<any> {
    const group = await this.prisma.group.create({
      data,
      include: {
        mentor: true,
        course: true,
      },
    });

    // Добавление курса к ментору
    await this.prisma.mentor.update({
      where: { id: data.mentorId },
      data: {
        courses: {
          connect: { id: data.courseId },
        },
      },
    });

    // Добавление ментора к курсу
    await this.prisma.course.update({
      where: { id: data.courseId },
      data: {
        mentors: {
          connect: { id: data.mentorId },
        },
      },
    });

    return group;
  }

  async findAll(
    paginationDto: PaginationDto,
    filter: any,
    user: User,
  ): Promise<PaginatedResult<Group>> {
    const justMentor = user.role.length === 1 && user.role[0] === 'mentor';

    const { page = 1 } = paginationDto;
    const skip = (page - 1) * 10;

    const [users, total] = await Promise.all([
      this.prisma.group.findMany({
        skip,
        take: filter.take ? +filter.take : 10,
        include: {
          mentor: { include: { user: true } },
          course: true,
        },
        where: {
          AND: [
            filter.status ? { status: filter.status } : {},
            filter.mentorId ? { mentorId: +filter.mentorId } : {},
            filter.courseId ? { courseId: +filter.courseId } : {},
            justMentor ? { mentor: { user: { id: user.id } } } : {},
          ],
          course: {
            branchId: user.branch,
          },
        },
      }),
      this.prisma.group.count({
        where: {
          AND: [
            filter.status ? { status: filter.status } : {},
            filter.mentorId ? { mentorId: +filter.mentorId } : {},
            filter.courseId ? { courseId: +filter.courseId } : {},
          ], // добавлен фильтр для подсчета
          course: {
            branchId: user.branch,
          },
        },
      }),
    ]);

    return {
      data: users,
      total,
      page,
      limit: filter.take ? +filter.take : 10,
    };
  }

  async finAllSelect(statuses: GroupStatus[], user: User): Promise<any> {
    const groups = await this.prisma.group.findMany({
      where: {
        status: {
          in: statuses,
        },
        course: {
          branchId: user.branch,
        },
      },
      include: {
        course: true,
      },
    });

    return groups.map((group) => ({
      value: group.id,
      label: group.name,
      coursePrice: group.course.price,
    }));
  }

  async findOne(id: number): Promise<any> {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        course: true,
        mentor: { include: { user: true } },
        responsible: true,
        groupStudents: {
          include: { student: true },
          orderBy: {
            student: {
              fio: 'asc',
            },
          },
        },
        exams: true,
      },
    });

    const lastLesson = await this.prisma.lesson.findFirst({
      where: {
        groupId: group.id,
        status: {
          not: 'waiting',
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      ...group,
      lastLessonDate: lastLesson
        ? lastLesson.date
        : new Date(new Date().setUTCHours(0, 0, 0, 0)),
    };
  }

  async getGroupsLessons(id: number, date: string): Promise<any> {
    console.log(date);
    const [month, year] = date.split('.').map((val) => parseInt(val, 10));

    // Создаем даты для начала и конца месяца
    const startOfMonth = new Date(year, month - 1, 1); // Начало месяца
    const endOfMonth = new Date(year, month, 0); // Конец месяца (последний день месяца)

    const lessons = await this.prisma.lesson.findMany({
      where: {
        groupId: id,
        date: {
          gte: startOfMonth, // Дата больше или равна началу месяца
          lte: endOfMonth, // Дата меньше или равна концу месяца
        },
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        group: {
          select: {
            groupStudents: {
              include: {
                student: true,
              },
            },
          },
        },
        id: true,
        status: true,
        date: true,
        students: {
          select: {
            student: {
              select: {
                id: true,
                fio: true,
              },
            },
            attended: true,
          },
        },
      },
    });

    const data = {
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        checked: lesson.status === 'completed',
        status: lesson.status,
        date: new Date(lesson.date).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
        }),
      })),
      students: (() => {
        const studentMap = new Map<
          number,
          { id: number; fio: string; attended: any }
        >();

        lessons.forEach((lesson) => {
          const studentsSource =
            lesson.status === 'waiting' && lesson.group
              ? lesson.group.groupStudents
              : lesson.students;

          const lessonStudentIds = new Set(
            studentsSource.map((studentData) =>
              lesson.status === 'waiting'
                ? studentData.student.id
                : studentData.student.id,
            ),
          );

          // Добавляем всех студентов группы
          (lesson.group?.groupStudents || []).forEach((groupStudent) => {
            const student = groupStudent.student;

            if (!studentMap.has(student.id)) {
              studentMap.set(student.id, {
                id: student.id,
                fio: student.fio,
                attended: [],
              });
            }

            // Проверяем, присутствует ли студент на уроке
            const attended = lessonStudentIds.has(student.id)
              ? (studentsSource.find(
                  (studentData) => studentData.student.id === student.id,
                  // @ts-ignore
                )?.attended ?? false)
              : false;

            const reason = lessonStudentIds.has(student.id)
              ? (studentsSource.find(
                  (studentData) => studentData.student.id === student.id,
                  // @ts-ignore
                )?.reason ?? null)
              : null;

            studentMap.get(student.id)?.attended.push({
              id: lesson.id,
              attendend: attended,
              checked: lesson.status === 'completed',
              reason,
            });
          });
        });

        return Array.from(studentMap.values());
      })(),
    };

    return data;
  }

  async findOneLessons(id: number, page: number = 1): Promise<any> {
    const skip = (page - 1) * 10;

    const lessonsCount = await this.prisma.lesson.count({
      where: {
        groupId: id,
      },
    });

    const groupLessons = await this.prisma.group.findUnique({
      where: { id },
      include: {
        lesson: {
          skip,
          take: 10,
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    return { lessons: groupLessons.lesson, total: lessonsCount };
  }

  async update(id: number, data: Group): Promise<Group> {
    const lastLesson = await this.prisma.lesson.findFirst({
      where: {
        groupId: id,
        status: {
          not: 'waiting',
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (data.status === 'frozen') {
      await this.lessonsService.removeWaitingLessonsForGroup(id);
    }

    if (lastLesson) {
      if (new Date(lastLesson.date) > new Date(data.toDate)) {
        throw new BadRequestException(
          "toDate can't under last actual lesson date",
        );
      } else if (
        new Date(lastLesson.date).getTime() === new Date(data.toDate).getTime()
      ) {
        await this.lessonsService.removeWaitingLessonsForGroup(id);

        return await this.prisma.group.update({
          where: { id },
          data: { ...data, status: 'completed' },
        });
      }
    }

    const updatedGroup = await this.prisma.group.update({
      where: { id },
      data,
    });

    if (updatedGroup.status === 'active') {
      await this.lessonsService.createLessonsForGroup(id);
    }

    // Добавление ментора к курсу
    await this.prisma.course.update({
      where: { id: updatedGroup.courseId },
      data: {
        mentors: {
          connect: { id: updatedGroup.mentorId },
        },
      },
    });

    return updatedGroup;
  }

  async remove(id: string): Promise<Group> {
    return this.prisma.group.delete({ where: { id: Number(id) } });
  }

  async updateGroupStatus(groupId: number, status: GroupStatus) {
    return this.prisma.group.update({
      where: { id: groupId },
      data: { status },
    });
  }

  async activateGroup(groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        groupStudents: true,
      },
    });

    if (group.groupStudents.length) {
      await this.lessonsService
        .createLessonsForGroup(group.id)
        .then(async () => {
          return await this.prisma.group.update({
            where: { id: groupId },
            data: { status: 'active' },
          });
        })
        .catch((e) => {
          throw new Error('Не удалось запустить группу');
        });
    } else {
      throw new Error('Нету студентов в группе');
    }
  }
}
