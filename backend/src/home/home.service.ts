import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  async getHomeData(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [dailyLog, recentLogs, userProfile, workoutPlan] = await Promise.all([
      this.prisma.dailyLog.findFirst({
        where: {
          userId,
          date: { gte: today, lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        },
        include: { meals: { include: { items: true } } },
      }),

      this.prisma.dailyLog.findMany({
        where: {
          userId,
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          weight: { not: null },
        },
        select: { date: true, weight: true },
        orderBy: { date: 'desc' },
        take: 7,
      }),

      this.prisma.userProfile.findUnique({ where: { userId } }),

      this.prisma.workoutPlan.findUnique({
        where: { userId },
        include: {
          days: {
            include: { exercises: { orderBy: { order: 'asc' } } },
            orderBy: { dayOfWeek: 'asc' },
          },
        },
      }),
    ]);

    const mealOptions = await this.prisma.meal.findMany({ take: 5 });

    // Normalise weekBlockNumber (schema was previously WeekBlockNumber)
    const profile = userProfile ? {
      ...userProfile,
      WeekBlockNumber: (userProfile as any).weekBlockNumber ?? (userProfile as any).WeekBlockNumber ?? 1,
    } : null;

    return {
      dailyLog,
      recentWeightHistory: recentLogs,
      userProfile: profile,
      workoutPlan,
      mealOptions,
      stats: {
        todayCalories: dailyLog?.meals.reduce((s, m) => s + m.totalKcal, 0) ?? 0,
        todayProtein: dailyLog?.meals.reduce((s, m) => s + m.protein, 0) ?? 0,
        currentWeight: dailyLog?.weight ?? recentLogs[0]?.weight,
        waterIntake: dailyLog?.waterIntake ?? 0,
        workoutCompleted: dailyLog?.workoutCompleted ?? false,
        dailyNotes: dailyLog?.notes ?? null,
      },
    };
  }
}
