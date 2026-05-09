import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklyProgressDto } from './create-weekly-progress.dto';

export class UpdateWeeklyProgressDto extends PartialType(CreateWeeklyProgressDto) {}
