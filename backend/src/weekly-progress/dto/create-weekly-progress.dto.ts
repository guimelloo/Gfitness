import { IsDateString, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateWeeklyProgressDto {
  @IsDateString()
  @IsNotEmpty()
  weekStart: Date;

  @IsDateString()
  @IsNotEmpty()
  weekEnd: Date;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsNumber()
  @IsOptional()
  averageCalories?: number;

  @IsNumber()
  @IsOptional()
  averageProtein?: number;

  @IsNumber()
  @IsOptional()
  workoutsCompleted?: number;

  @IsNumber()
  @IsOptional()
  mealsCompleted?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
