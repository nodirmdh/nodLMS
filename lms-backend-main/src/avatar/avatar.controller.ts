import { Controller, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Get, Res, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarService } from './avatar.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { join } from 'path';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("Avatars")
@Controller('avatars')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Invalid file type or file size exceeds the limit',
      );
    }
    const url = `/avatars/${file.filename}`; // URL для доступа к файлу
    const createAvatarDto: CreateAvatarDto = { url };
    return this.avatarService.create(createAvatarDto);
  }

  @Get(':imgPath')
  seeUploadedFile(@Param('imgPath') image: string, @Res() res: Response) {
    // Defense against path traversal: only allow simple filenames.
    if (!/^[A-Za-z0-9._-]+$/.test(image) || image.includes('..')) {
      throw new BadRequestException('Invalid file name');
    }
    return res.sendFile(join(process.cwd(), 'uploads', image));
  }
}
