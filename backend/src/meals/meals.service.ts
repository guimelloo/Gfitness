import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMealDto) {
    return this.prisma.meal.create({ data, include: { items: true } });
  }

  async findAll() {
    return this.prisma.meal.findMany({ include: { items: true } });
  }

  async findByUser(userId: string) {
    return this.prisma.meal.findMany({
      where: { userId },
      include: { items: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.meal.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async update(id: string, data: UpdateMealDto) {
    return this.prisma.meal.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  async remove(id: string) {
    return this.prisma.meal.delete({ where: { id } });
  }
}
