import { PartialType } from '@nestjs/mapped-types';
import { CreateCoachNoteDto } from './create-coach-note.dto';

export class UpdateCoachNoteDto extends PartialType(CreateCoachNoteDto) {}
