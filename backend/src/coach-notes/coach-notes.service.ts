import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoachNoteDto } from './dto/create-coach-note.dto';
import { UpdateCoachNoteDto } from './dto/update-coach-note.dto';

@Injectable()
export class CoachNotesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCoachNoteDto) {
    return this.prisma.coachNote.create({ data });
  }

  async findAll() {
    return this.prisma.coachNote.findMany();
  }

  async findByUser(userId: string) {
    return this.prisma.coachNote.findMany({ where: { userId } });
  }

  async findOne(id: string) {
    return this.prisma.coachNote.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateCoachNoteDto) {
    return this.prisma.coachNote.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.coachNote.delete({ where: { id } });
  }
}
