import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAlertDto) {
    return this.prisma.alert.create({ data });
  }

  async findAll() {
    return this.prisma.alert.findMany();
  }

  async findByUser(userId: string) {
    return this.prisma.alert.findMany({ where: { userId } });
  }

  async findOne(id: string) {
    return this.prisma.alert.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateAlertDto) {
    return this.prisma.alert.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.alert.delete({ where: { id } });
  }
}
