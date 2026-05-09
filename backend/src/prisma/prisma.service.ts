import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Direct access to Prisma models
  get user() {
    return this.prisma.user;
  }

  get workout() {
    return this.prisma.workout;
  }

  get exercise() {
    return this.prisma.exercise;
  }

  get meal() {
    return this.prisma.meal;
  }

  get mealItem() {
    return this.prisma.mealItem;
  }

  get checkin() {
    return this.prisma.checkin;
  }

  get alert() {
    return this.prisma.alert;
  }

  get coachNote() {
    return this.prisma.coachNote;
  }

  get notification() {
    return this.prisma.notification;
  }

  get weeklyProgress() {
    return this.prisma.weeklyProgress;
  }

  get youtubeVideo() {
    return this.prisma.youtubeVideo;
  }

  get exerciseSubstitution() {
    return this.prisma.exerciseSubstitution;
  }

  get workoutExercise() {
    return this.prisma.workoutExercise;
  }

  get dailyLog() {
    return this.prisma.dailyLog;
  }

  get mealLog() {
    return this.prisma.mealLog;
  }

  get mealLogItem() {
    return this.prisma.mealLogItem;
  }

  get userProfile() {
    return this.prisma.userProfile;
  }

  get nutritionCache() {
    return this.prisma.nutritionCache;
  }

  get workoutPlan() {
    return this.prisma.workoutPlan;
  }

  get workoutPlanDay() {
    return this.prisma.workoutPlanDay;
  }

  get workoutPlanExercise() {
    return this.prisma.workoutPlanExercise;
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
