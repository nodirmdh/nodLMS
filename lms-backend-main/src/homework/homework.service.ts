import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHomeworkDto,
  ReviewSubmissionDto,
  SubmitHomeworkDto,
  UpdateHomeworkDto,
} from './dto/homework.dto';

@Injectable()
export class HomeworkService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: { groupId?: number; lessonId?: number }) {
    return this.prisma.homework.findMany({
      where: {
        ...(filter.groupId ? { groupId: filter.groupId } : {}),
        ...(filter.lessonId ? { lessonId: filter.lessonId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { submissions: true } },
      },
    });
  }

  async get(id: number) {
    return this.prisma.homework.findUnique({
      where: { id },
      include: {
        submissions: { orderBy: { submittedAt: 'desc' } },
      },
    });
  }

  async create(dto: CreateHomeworkDto, createdBy: number | null) {
    if (!dto.groupId && !dto.lessonId) {
      throw new BadRequestException('groupId or lessonId is required');
    }
    return this.prisma.homework.create({
      data: {
        title: dto.title,
        description: dto.description,
        groupId: dto.groupId ?? null,
        lessonId: dto.lessonId ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        attachments: (dto.attachments ??
          []) as unknown as Prisma.InputJsonValue,
        createdBy,
      },
    });
  }

  async update(id: number, dto: UpdateHomeworkDto) {
    const data: Prisma.HomeworkUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.dueDate !== undefined)
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.attachments !== undefined)
      data.attachments = dto.attachments as unknown as Prisma.InputJsonValue;
    return this.prisma.homework.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.homework.delete({ where: { id } });
  }

  async submit(homeworkId: number, dto: SubmitHomeworkDto) {
    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
    });
    if (!homework) throw new NotFoundException('homework not found');

    return this.prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId: dto.studentId,
        },
      },
      update: {
        comment: dto.comment ?? null,
        files: (dto.files ?? []) as unknown as Prisma.InputJsonValue,
        status: 'submitted',
        submittedAt: new Date(),
        grade: null,
        reviewerComment: null,
        reviewedAt: null,
        reviewedBy: null,
      },
      create: {
        homeworkId,
        studentId: dto.studentId,
        comment: dto.comment ?? null,
        files: (dto.files ?? []) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async review(
    submissionId: number,
    dto: ReviewSubmissionDto,
    reviewerId: number | null,
  ) {
    const data: Prisma.HomeworkSubmissionUpdateInput = {
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    };
    if (dto.grade !== undefined) data.grade = dto.grade;
    if (dto.reviewerComment !== undefined)
      data.reviewerComment = dto.reviewerComment;
    if (dto.status !== undefined) data.status = dto.status;
    else data.status = 'reviewed';

    return this.prisma.homeworkSubmission.update({
      where: { id: submissionId },
      data,
    });
  }

  async listSubmissions(homeworkId: number) {
    return this.prisma.homeworkSubmission.findMany({
      where: { homeworkId },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
