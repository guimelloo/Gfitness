import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  type: 'WORKOUT_REMINDER' | 'MEAL_REMINDER' | 'CHECKIN_REMINDER' | 'COACH_MESSAGE' | 'ALERT';

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
