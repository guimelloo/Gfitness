import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCoachNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
