import { Module } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { BonusController } from './bonus.controller';

@Module({
  providers: [BonusService],
  controllers: [BonusController]
})
export class BonusModule {}
