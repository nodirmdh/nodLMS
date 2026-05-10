import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Course, Prisma, User } from '@prisma/client';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCourseDto): Promise<Course> {
    return this.prisma.course.create({ data });
  }

  async findAll(user: User): Promise<any> {
    return await this.prisma.course
      .findMany({
        where: {
          branchId: user.branch,
        },
        include: {
          mentors: true,
          groups: true,
          students: true,
        },
      })
      .then((courses) =>
        courses.map((course) => ({
          ...course,
          groups: course.groups.length,
          students: course.students.length,
        })),
      );
  }

  async findOne(id: number): Promise<Course> {
    return this.prisma.course.findUnique({
      where: { id },
      include: { students: true, groups: true, mentors: true, leeds: true },
    });
  }

  async update(id: number, data: Prisma.CourseUpdateInput): Promise<Course> {
    return this.prisma.course.update({ where: { id }, data });
  }

  async remove(id: number): Promise<Course> {
    return this.prisma.course.delete({ where: { id } });
  }
}
