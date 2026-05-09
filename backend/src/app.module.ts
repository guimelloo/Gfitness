import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { ExercisesModule } from './exercises/exercises.module';
import { MealsModule } from './meals/meals.module';
import { CheckinsModule } from './checkins/checkins.module';
import { AlertsModule } from './alerts/alerts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CoachNotesModule } from './coach-notes/coach-notes.module';
import { WeeklyProgressModule } from './weekly-progress/weekly-progress.module';
import { AiModule } from './ai/ai.module';
import { YoutubeModule } from './youtube/youtube.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { DailyLogsModule } from './daily-logs/daily-logs.module';
import { HomeModule } from './home/home.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    WorkoutsModule,
    ExercisesModule,
    MealsModule,
    CheckinsModule,
    AlertsModule,
    NotificationsModule,
    CoachNotesModule,
    WeeklyProgressModule,
    AiModule,
    YoutubeModule,
    PrismaModule,
    CommonModule,
    DailyLogsModule,
    HomeModule,
    NutritionModule,
    WorkoutPlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
