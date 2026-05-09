import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDailyLogDto, UpdateDailyLogDto, AddMealLogDto } from './dto/create-daily-log.dto';

@Injectable()
export class DailyLogsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateDailyLogDto) {
    return this.prisma.dailyLog.create({
      data: {
        userId,
        date: new Date(dto.date),
        weight: dto.weight,
        workoutCompleted: dto.workoutCompleted,
        workoutType: dto.workoutType,
        waterIntake: dto.waterIntake,
        notes: dto.notes,
      },
    });
  }

  async findByDate(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.dailyLog.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        meals: true,
      },
    });
  }

  async findByRange(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.dailyLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        meals: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async update(userId: string, date: Date, dto: UpdateDailyLogDto) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.dailyLog.updateMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      data: dto,
    });
  }

  async getTodayLog(userId: string) {
    const today = new Date();
    return this.findByDate(userId, today);
  }

  async getRecentLogs(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.findByRange(userId, startDate, endDate);
  }

  async addMeal(userId: string, dto: AddMealLogDto) {
    // Determine the date to use
    const mealDate = dto.date ? new Date(dto.date) : new Date();
    
    // Get or create daily log for this date
    let dailyLog = await this.findByDate(userId, mealDate);
    
    if (!dailyLog) {
      // Create a new daily log if it doesn't exist
      dailyLog = await this.prisma.dailyLog.create({
        data: {
          userId,
          date: mealDate,
        },
        include: {
          meals: true,
        },
      });
    }

    // Add meal to the daily log
    const mealLog = await this.prisma.mealLog.create({
      data: {
        dailyLogId: dailyLog.id,
        mealName: dto.mealName,
        totalKcal: dto.totalKcal,
        protein: dto.protein,
        carbs: dto.carbs,
        fat: dto.fat,
      },
    });

    return mealLog;
  }

  async removeMeal(userId: string, mealLogId: string) {
    const meal = await this.prisma.mealLog.findUnique({
      where: { id: mealLogId },
      include: { dailyLog: { select: { userId: true } } },
    });
    if (!meal) throw new NotFoundException('Meal not found');
    if (meal.dailyLog.userId !== userId) throw new ForbiddenException('Not allowed');
    return this.prisma.mealLog.delete({ where: { id: mealLogId } });
  }

  async delete(userId: string, id: string) {
    // Verify the daily log belongs to the user before deleting
    const dailyLog = await this.prisma.dailyLog.findUnique({
      where: { id },
    });

    if (!dailyLog) {
      throw new BadRequestException('Daily log not found');
    }

    if (dailyLog.userId !== userId) {
      throw new BadRequestException('Unauthorized to delete this daily log');
    }

    // Delete all meals associated with this daily log first
    await this.prisma.mealLog.deleteMany({
      where: {
        dailyLogId: id,
      },
    });

    // Then delete the daily log
    return this.prisma.dailyLog.delete({
      where: {
        id,
      },
    });
  }
}

