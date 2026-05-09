import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CoachNotesService } from './coach-notes.service';
import { CreateCoachNoteDto } from './dto/create-coach-note.dto';
import { UpdateCoachNoteDto } from './dto/update-coach-note.dto';

@Controller('coach-notes')
export class CoachNotesController {
  constructor(private readonly coachNotesService: CoachNotesService) {}

  @Post()
  create(@Body() createCoachNoteDto: CreateCoachNoteDto) {
    return this.coachNotesService.create(createCoachNoteDto);
  }

  @Get()
  findAll() {
    return this.coachNotesService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.coachNotesService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coachNotesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoachNoteDto: UpdateCoachNoteDto) {
    return this.coachNotesService.update(id, updateCoachNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coachNotesService.remove(id);
  }
}
