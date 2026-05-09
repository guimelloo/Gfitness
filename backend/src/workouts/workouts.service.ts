import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateWorkoutDto) {
    try {
      return await this.prisma.workout.create({ data, include: { exercises: true } });
    } catch {
      throw new InternalServerErrorException('Failed to create workout');
    }
  }

  async findAll() {
    try {
      return await this.prisma.workout.findMany({ include: { exercises: true } });
    } catch {
      throw new InternalServerErrorException('Failed to fetch workouts');
    }
  }

  async findByUser(userId: string) {
    try {
      return await this.prisma.workout.findMany({
        where: { userId },
        include: { exercises: true },
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch user workouts');
    }
  }

  async findOne(id: string) {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
      include: { exercises: true },
    });

    if (!workout) {
      throw new NotFoundException(`Workout with id "${id}" not found`);
    }

    return workout;
  }

  async update(id: string, data: UpdateWorkoutDto, requestingUserId?: string) {
    const workout = await this.findOne(id);

    if (requestingUserId && workout.userId !== requestingUserId) {
      throw new ForbiddenException('You are not allowed to update this workout');
    }

    try {
      return await this.prisma.workout.update({
        where: { id },
        data,
        include: { exercises: true },
      });
    } catch {
      throw new InternalServerErrorException('Failed to update workout');
    }
  }

  async remove(id: string, requestingUserId?: string) {
    const workout = await this.findOne(id);

    if (requestingUserId && workout.userId !== requestingUserId) {
      throw new ForbiddenException('You are not allowed to delete this workout');
    }

    try {
      return await this.prisma.workout.delete({ where: { id } });
    } catch {
      throw new InternalServerErrorException('Failed to delete workout');
    }
  }
}
