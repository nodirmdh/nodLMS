import { Injectable } from '@nestjs/common';
import { Lesson, LessonStudentReason, User } from '@prisma/client';
import { addDays, getMonth, format } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { countLessonsInMonth } from 'src/shared/utils/lesson-price';
import { SMSService } from 'src/sms/sms.service';

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private smsService: SMSService,
  ) {}

  async create(data: Lesson, user: User): Promise<Lesson> {
    return await this.prisma.lesson.create({
      data: { ...data, branchId: user.branch },
    });
  }

  async findAll(user: User): Promise<Lesson[]> {
    return await this.prisma.lesson.findMany({
      where: {
        group: {
          course: {
            branchId: user.branch,
          },
        },
      },
    });
  }

  async findAllByDate(data: { date: string }, user: User): Promise<Lesson[]> {
    const justMentor = user.role.length === 1 && user.role[0] === 'mentor';

    return await this.prisma.lesson.findMany({
      where: {
        date: data.date,
        OR: [
          {
            group: {
              course: {
                branchId: user.branch,
              },
            },
          },
          {
            branchId: user.branch,
          },
        ],
        AND: [justMentor ? { mentor: { user: { id: user.id } } } : {}],
      },
      include: {
        mentor: { include: { user: true } },
        responsible: true,
        group: { include: { course: true } },
      },
    });
  }

  async find(id: number): Promise<any> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        responsible: true,
        mentor: { include: { user: true } },
        group: true,
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (!lesson.groupId) {
      return lesson;
    }

    const activeStudents = await this.prisma.groupStudent.findMany({
      where: {
        groupId: lesson.group.id,
        status: 'active',
      },
      include: {
        student: true,
      },
      orderBy: {
        student: {
          fio: 'asc',
        },
      },
    });

    return {
      ...lesson,
      students: activeStudents,
    };
  }

  async getLessonWithAttendance(id: number) {
    return await this.prisma.lesson.findUnique({
      where: {
        id,
      },
      include: {
        responsible: true,
        mentor: { include: { user: true } },
        group: true,
        students: {
          include: {
            student: true,
          },
        },
      },
    });
  }

  async removeWaitingLessonsForGroup(groupId: number) {
    return await this.prisma.lesson.deleteMany({
      where: {
        groupId,
        status: 'waiting',
      },
    });
  }

  async createLessonsForGroup(groupId: number) {
    const oldLessonsCount = await this.prisma.lesson.count({
      where: {
        groupId,
        status: {
          not: 'waiting',
        },
      },
    });

    const lastActualLesson = await this.prisma.lesson.findFirst({
      where: {
        groupId,
        status: {
          not: 'waiting',
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    await this.prisma.lesson.deleteMany({
      where: {
        groupId,
        status: 'waiting',
      },
    });

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        course: true,
        lesson: true,
      },
    });

    const {
      fromDate,
      toDate,
      classDays,
      startTime,
      endTime,
      name,
      mentorId,
      responsibleId,
    } = group;

    const lessons = [];
    let currentDate = new Date(
      lastActualLesson ? addDays(lastActualLesson.date, 1) : fromDate,
    );

    let count = oldLessonsCount + 1 || 1;

    while (currentDate <= toDate) {
      if (this.isClassDay(currentDate, classDays)) {
        const lesson = {
          name: `${name} - Урок ${count}`,
          date: new Date(currentDate.setUTCHours(0, 0, 0, 0)).toISOString(),
          startTime,
          endTime,
          groupId,
          mentorId,
          group: {
            connect: { id: groupId },
          },
          mentor: mentorId ? { connect: { id: mentorId } } : undefined,
          responsible: responsibleId
            ? { connect: { id: responsibleId } }
            : undefined,
          responsibleId,
        };
        lessons.push(lesson);
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return this.prisma.$transaction(
      lessons.map((lesson) =>
        this.prisma.lesson.create({
          data: {
            name: lesson.name,
            date: lesson.date,
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            groupId: lesson.groupId,
            mentorId: lesson.mentorId,
            responsibleId: lesson.responsibleId,
          },
        }),
      ),
    );
  }

  isClassDay(date: Date, classDays: string[]): boolean {
    const day = date.getDay();
    const oddDays = [1, 3, 5]; // Monday, Wednesday, Friday
    const evenDays = [2, 4, 6]; // Tuesday, Thursday, Saturday
    const daysMap = {
      Sun: 0,
      Mon: 1,
      Tues: 2,
      Wednes: 3,
      Thurs: 4,
      Fri: 5,
      Satur: 6,
    };

    if (classDays.includes('every') && day !== 0) return true;
    if (classDays.includes('odd') && oddDays.includes(day)) return true;
    if (classDays.includes('even') && evenDays.includes(day)) return true;
    return classDays.some((dayStr) => daysMap[dayStr] === day);
  }

  async attendanceMentor(lessonId: number, students: any) {
    for (const student of students) {
      await this.prisma.studentOnLesson.upsert({
        where: {
          studentId_lessonId: {
            studentId: student.studentId,
            lessonId: lessonId,
          },
        },
        update: {
          attended: student.attended,
          discount: student.discount,
        },
        create: {
          studentId: student.studentId,
          lessonId: lessonId,
          attended: student.attended,
          discount: student.discount,
        },
      });
    }

    return await this.prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        status: 'waitingConfirm',
      },
    });
  }

  async payLesson(
    groupId: number,
    mentorId: number,
    students: any[],
    lessonId: number,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    const mentor = await this.prisma.mentor.findUnique({
      where: { id: mentorId },
      include: { user: true },
    });

    const course = await this.prisma.course.findUnique({
      where: { id: group.courseId },
    });

    const lessonPrice =
      course.price /
      countLessonsInMonth(
        getMonth(new Date(lesson.date).toUTCString()) + 1,
        group.classDays,
      );

    if (mentor.user.salaryMentorType === 'fixedLesson') {
      await this.prisma.user.update({
        where: { id: mentor.user.id },
        data: {
          availableBalance:
            mentor.user.availableBalance + mentor.user.salaryMentor,
        },
      });
    } else if (mentor.user.salaryMentorType === 'percentLesson') {
      const amount = students.reduce((total, student) => {
        const studentDiscountLessonPrice =
          student.discount /
          countLessonsInMonth(
            getMonth(new Date(lesson.date).toUTCString()) + 1,
            group.classDays,
          );

        const discountedPrice = lessonPrice - studentDiscountLessonPrice;

        const resultAmount = discountedPrice * (mentor.user.salaryMentor / 100);

        return total + resultAmount;
      }, 0);

      await this.prisma.user.update({
        where: { id: mentor.user.id },
        data: {
          balance: mentor.user.balance + amount,
        },
      });
    }

    for (const student of students) {
      const studentDB = await this.prisma.student.findUnique({
        where: { id: student.studentId },
      });
      // if (student.attended) {
      const studentDiscountLessonPrice =
        student.discount /
        countLessonsInMonth(
          getMonth(new Date(lesson.date).toUTCString()) + 1,
          group.classDays,
        );

      const amount = lessonPrice - studentDiscountLessonPrice;

      await this.prisma.student.update({
        where: {
          id: student.studentId,
        },
        data: {
          balance: studentDB.balance - amount,
        },
      });
      // }
    }
  }

  async confirmLesson(
    lessonId: number,
    students: {
      attended: any;
      studentId: number;
      reason: LessonStudentReason;
    }[],
  ) {
    return await this.prisma.$transaction(async (prisma) => {
      for (const student of students) {
        await prisma.studentOnLesson.update({
          where: {
            studentId_lessonId: {
              studentId: student.studentId,
              lessonId: lessonId,
            },
          },
          data: {
            attended: student.attended,
            reason: student.reason,
          },
        });
      }

      const result = await prisma.lesson.update({
        where: {
          id: lessonId,
        },
        data: {
          status: 'completed',
        },
      });

      const group = await prisma.group.findUnique({
        where: { id: result.groupId },
        include: { course: true },
      });

      const date = new Date(result.date);
      const formattedDate = format(date, 'dd.MM.yyyy');

      const notAttendedStudents = students
        .filter((student) => {
          if (student.attended === false && student.reason !== 'askedOff') {
            return student;
          }
        }) // фильтрация тех, кто не посещал
        .flatMap((student: any) => {
          const entries = [];

          if (student.mother.phone) {
            entries.push({
              fio: student.student.fio,
              phone: student.mother.phone,
            });
          }

          if (student.father && student.father.phone) {
            entries.push({
              fio: student.student.fio,
              phone: student.father.phone,
            });
          }

          return entries;
        })
        .map(({ fio, phone }: any) => {
          return {
            smsid: Math.floor(Math.random() * (2000 - 100 + 1)) + 100,
            phone: phone,
            text: `Eskertiw! Hu'rmetli ata-ana sizdin' perzentin'iz ${fio.toUpperCase()} RUSTAMBEK OQIW ORAYinda 
            ${formattedDate} kúni sabaqqa qatnaspadi. Keyingi sabaqqa qatnasiwin ta'minlewdi soraymiz. 
            RUSTAMBEK OQIW ORAYI Administratsciya. tel: 941235151`,
          };
        });

      if (notAttendedStudents.length) {
        await this.smsService.sendLessonGroupSMS(notAttendedStudents);
      }
      const lessonStudents = await this.prisma.studentOnLesson.findMany({
        where: {
          lessonId: result.id,
        },
      });

      await this.payLesson(
        result.groupId,
        result.mentorId,
        lessonStudents,
        lessonId,
      );

      return result;
    });
  }

  async update(id: number, data: Lesson): Promise<Lesson> {
    return await this.prisma.lesson.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  }
}
