import { Module, BadRequestException } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';

const ALLOWED_MIMES = new Set([
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          // Random cryptographically-safe filename, never trust client name.
          const ext = extname(file.originalname).toLowerCase();
          const safeExt = ALLOWED_EXTS.has(ext) ? ext : '';
          const random = randomBytes(16).toString('hex');
          callback(null, `${file.fieldname}-${Date.now()}-${random}${safeExt}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        if (
          !ALLOWED_MIMES.has(file.mimetype) ||
          !ALLOWED_EXTS.has(ext)
        ) {
          return callback(
            new BadRequestException(
              'Only jpg, jpeg, png, webp files are allowed',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 1,
      },
    }),
  ],
  controllers: [AvatarController],
  providers: [AvatarService],
})
export class AvatarModule {}
