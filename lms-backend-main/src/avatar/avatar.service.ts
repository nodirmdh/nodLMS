import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';

@Injectable()
export class AvatarService {
  constructor(private prisma: PrismaService) {}

  async create(createAvatarDto: CreateAvatarDto) {
    return this.prisma.avatar.create({
      data: createAvatarDto,
    });
  }
}
