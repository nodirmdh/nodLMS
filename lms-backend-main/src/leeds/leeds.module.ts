import { Module } from '@nestjs/common';
import { LeedsService } from './leeds.service';
import { LeedsController } from './leeds.controller';

@Module({
  providers: [LeedsService],
  controllers: [LeedsController]
})
export class LeedsModule {}
