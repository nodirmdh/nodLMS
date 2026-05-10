import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService,  {
    provide: 'JWT_SERVICE',
    useFactory: (configService: ConfigService) => ({
      sign: (payload: object) => {
        return jwt.sign(payload, configService.get<string>('JWT_SECRET'), {
          expiresIn: '1d',
        });
      },
      verify: (token: string) => {
        return jwt.verify(token, configService.get<string>('JWT_SECRET'));
      },
    }),
    inject: [ConfigService],
  },],
  exports: [UsersService, 'JWT_SERVICE'],
})
export class UsersModule {}
