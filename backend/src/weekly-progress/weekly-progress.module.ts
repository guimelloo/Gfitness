import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WeeklyProgressService } from './weekly-progress.service';
import { WeeklyProgressController } from './weekly-progress.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WeeklyProgressController],
  providers: [WeeklyProgressService],
  exports: [WeeklyProgressService],
})
export class WeeklyProgressModule {}
