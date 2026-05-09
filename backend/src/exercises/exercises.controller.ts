import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get('media/:name')
  @HttpCode(200)
  async getExerciseMedia(@Param('name') name: string, @Res() res: Response) {
    const media = await this.exercisesService.getExerciseMedia(name);

    if (!media.gifUrl && !media.videoUrl) {
      return res.status(404).json({
        error: 'Exercise media not found',
        name,
      });
    }

    return res.json({
      ...media,
      exercise: name,
    });
  }

  @Post()
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Get()
  findAll() {
    return this.exercisesService.findAll();
  }

  @Get('muscle-group/:muscleGroup')
  findByMuscleGroup(@Param('muscleGroup') muscleGroup: string) {
    return this.exercisesService.findByMuscleGroup(muscleGroup);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exercisesService.remove(id);
  }
}
