import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Exam, ExamGrade, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';
import { addExamDto } from './dto/add-exam.dto';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    paginationDto: PaginationDto,
    filter: any,
    user: User,
  ): Promise<PaginatedResult<Exam>> {
    const { page = 1 } = paginationDto;
    const skip = (page - 1) * 10;
    const justMentor = user.role.length === 1 && user.role[0] === 'mentor';

    const [exams, total] = await Promise.all([
      this.prisma.exam.findMany({
        where: {
          AND: [
            filter.groupId ? { groupId: +filter.groupId } : {},
            filter.status ? { status: filter.status } : {},
            justMentor ? { responsible: { id: user.id } } : {},
          ],
          group: {
            course: {
              branchId: user.branch,
            },
          },
        },
        skip,
        take: 10,
      }),
      this.prisma.exam.count({
        where: {
          AND: [
            filter.groupId ? { groupId: +filter.groupId } : {},
            filter.responsibleId
              ? { responsibleId: +filter.responsibleId }
              : {},
            justMentor ? { responsible: { id: user.id } } : {},
          ],
          group: {
            course: {
              branchId: user.branch,
            },
          },
        },
      }),
    ]);

    return {
      data: exams,
      total,
      page,
      limit: 10,
    };
  }

  async create(data: Exam): Promise<Exam> {
    return await this.prisma.exam.create({ data });
  }

  async find(id: number): Promise<Exam> {
    return await this.prisma.exam.findUnique({
      where: { id },
      include: {
        group: { include: { groupStudents: { include: { student: true } } } },
        grades: {
          include: {
            student: true,
          },
        },
        responsible: true,
      },
    });
  }

  async update(id: number, data: Exam): Promise<Exam> {
    return await this.prisma.exam.update({ where: { id }, data });
  }

  async remove(id: number) {
    return await this.prisma.exam.delete({ where: { id } });
  }

  // Метод для добавления/обновления оценок нескольким студентам на экзамене
  async addOrUpdateExamGrades(
    examId: number,
    studentGrades: addExamDto[],
    user: User,
  ): Promise<ExamGrade[]> {
    // Проверяем, существует ли экзамен
    const examExists = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!examExists) {
      throw new NotFoundException('Exam not found');
    }

    // Добавляем или обновляем оценки
    const examGradePromises = studentGrades.map(
      ({ studentId, grade, comment }) =>
        this.prisma.examGrade.upsert({
          where: {
            examId_studentId: {
              examId,
              studentId,
            },
          },
          update: {
            grade,
            comment,
          },
          create: {
            examId,
            studentId,
            grade,
            comment,
          },
        }),
    );

    if (
      examExists.responsibleId === user.id ||
      user.role.includes('CEO') ||
      user.role.includes('admin')
    ) {
      await this.prisma.exam.update({
        where: { id: examExists.id },
        data: { status: 'passed' },
      });

      return Promise.all(examGradePromises);
    } else {
      throw new ForbiddenException();
    }
  }
}
