import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';

@Injectable()
export class CheckinsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCheckinDto) {
    return this.prisma.checkin.create({ data });
  }

  async findAll() {
    return this.prisma.checkin.findMany();
  }

  async findByUser(userId: string) {
    return this.prisma.checkin.findMany({ where: { userId } });
  }

  async findOne(id: string) {
    return this.prisma.checkin.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateCheckinDto) {
    return this.prisma.checkin.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.checkin.delete({ where: { id } });
  }
}
