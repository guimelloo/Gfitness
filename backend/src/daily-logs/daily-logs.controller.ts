import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { DailyLogsService } from './daily-logs.service';
import { CreateDailyLogDto, UpdateDailyLogDto, AddMealLogDto } from './dto/create-daily-log.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('daily-logs')
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Post()
  create(@Req() req, @Body() createDailyLogDto: CreateDailyLogDto) {
    return this.dailyLogsService.create(req.user.sub, createDailyLogDto);
  }

  @Get('today')
  getTodayLog(@Req() req) {
    return this.dailyLogsService.getTodayLog(req.user.sub);
  }

  @Get('date/:date')
  findByDate(@Req() req, @Param('date') date: string) {
    return this.dailyLogsService.findByDate(req.user.sub, new Date(date));
  }

  @Get('recent')
  getRecent(@Req() req, @Query('days') days: string = '30') {
    return this.dailyLogsService.getRecentLogs(req.user.sub, parseInt(days, 10));
  }

  @Get('range')
  findByRange(
    @Req() req,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.dailyLogsService.findByRange(
      req.user.sub,
      new Date(start),
      new Date(end),
    );
  }

  @Patch('date/:date')
  update(
    @Req() req,
    @Param('date') date: string,
    @Body() updateDailyLogDto: UpdateDailyLogDto,
  ) {
    return this.dailyLogsService.update(req.user.sub, new Date(date), updateDailyLogDto);
  }

  @Post('meals/add')
  addMeal(
    @Req() req,
    @Body() addMealDto: AddMealLogDto,
  ) {
    return this.dailyLogsService.addMeal(req.user.sub, addMealDto);
  }

  @Delete('meals/:mealLogId')
  removeMeal(@Req() req, @Param('mealLogId') mealLogId: string) {
    return this.dailyLogsService.removeMeal(req.user.sub, mealLogId);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.dailyLogsService.delete(req.user.sub, id);
  }
}
