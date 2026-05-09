import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeeklyProgressDto } from './dto/create-weekly-progress.dto';
import { UpdateWeeklyProgressDto } from './dto/update-weekly-progress.dto';

@Injectable()
export class WeeklyProgressService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateWeeklyProgressDto) {
    try {
      return await this.prisma.weeklyProgress.create({ data });
    } catch {
      throw new InternalServerErrorException('Failed to create weekly progress');
    }
  }

  async findAll() {
    try {
      return await this.prisma.weeklyProgress.findMany();
    } catch {
      throw new InternalServerErrorException('Failed to fetch weekly progress records');
    }
  }

  async findByUser(userId: string) {
    try {
      return await this.prisma.weeklyProgress.findMany({ where: { userId } });
    } catch {
      throw new InternalServerErrorException('Failed to fetch user weekly progress');
    }
  }

  async findOne(id: string) {
    const record = await this.prisma.weeklyProgress.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Weekly progress with id "${id}" not found`);
    }
    return record;
  }

  async update(id: string, data: UpdateWeeklyProgressDto, requestingUserId?: string) {
    const record = await this.findOne(id);

    if (requestingUserId && record.userId !== requestingUserId) {
      throw new ForbiddenException('You are not allowed to update this weekly progress');
    }

    try {
      return await this.prisma.weeklyProgress.update({ where: { id }, data });
    } catch {
      throw new InternalServerErrorException('Failed to update weekly progress');
    }
  }

  async remove(id: string, requestingUserId?: string) {
    const record = await this.findOne(id);

    if (requestingUserId && record.userId !== requestingUserId) {
      throw new ForbiddenException('You are not allowed to delete this weekly progress');
    }

    try {
      return await this.prisma.weeklyProgress.delete({ where: { id } });
    } catch {
      throw new InternalServerErrorException('Failed to delete weekly progress');
    }
  }
}
