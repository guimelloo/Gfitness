import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCheckinDto {
  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @IsNumber()
  @IsOptional()
  bodyFat?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
