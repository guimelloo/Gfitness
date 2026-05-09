import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MealsController],
  providers: [MealsService],
  exports: [MealsService],
})
export class MealsModule {}
