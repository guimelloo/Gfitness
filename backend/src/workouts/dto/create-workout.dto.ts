import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateWorkoutDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  date!: Date;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}
