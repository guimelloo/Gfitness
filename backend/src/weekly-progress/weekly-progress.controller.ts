import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WeeklyProgressService } from './weekly-progress.service';
import { CreateWeeklyProgressDto } from './dto/create-weekly-progress.dto';
import { UpdateWeeklyProgressDto } from './dto/update-weekly-progress.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('weekly-progress')
export class WeeklyProgressController {
  constructor(private readonly weeklyProgressService: WeeklyProgressService) {}

  @Post()
  create(@Body() createWeeklyProgressDto: CreateWeeklyProgressDto) {
    return this.weeklyProgressService.create(createWeeklyProgressDto);
  }

  @Get()
  findAll() {
    return this.weeklyProgressService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.weeklyProgressService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weeklyProgressService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWeeklyProgressDto: UpdateWeeklyProgressDto,
    @Request() req: any,
  ) {
    return this.weeklyProgressService.update(id, updateWeeklyProgressDto, req.user?.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.weeklyProgressService.remove(id, req.user?.sub);
  }
}
