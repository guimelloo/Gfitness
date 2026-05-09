import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CoachNotesService } from './coach-notes.service';
import { CoachNotesController } from './coach-notes.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CoachNotesController],
  providers: [CoachNotesService],
  exports: [CoachNotesService],
})
export class CoachNotesModule {}
