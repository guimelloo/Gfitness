import { IsDate, IsOptional, IsNumber, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDailyLogDto {
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsBoolean()
  workoutCompleted?: boolean;

  @IsOptional()
  @IsString()
  workoutType?: string;

  @IsOptional()
  @IsNumber()
  waterIntake?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDailyLogDto {
  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsBoolean()
  workoutCompleted?: boolean;

  @IsOptional()
  @IsString()
  workoutType?: string;

  @IsOptional()
  @IsNumber()
  waterIntake?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddMealLogDto {
  @IsString()
  mealName: string; // ex: "Café da manhã", "Almoço"

  @IsNumber()
  totalKcal: number;

  @IsNumber()
  protein: number;

  @IsNumber()
  carbs: number;

  @IsNumber()
  fat: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date; // If not provided, uses today
}
