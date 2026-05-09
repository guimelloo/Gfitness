import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, Req, Res, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { WorkoutPlansService } from './workout-plans.service';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller('workout-plans')
@UseGuards(JwtGuard)
export class WorkoutPlansController {
  constructor(private readonly service: WorkoutPlansService) {}

  @Get()
  async getMyPlan(@Req() req) {
    const plan = await this.service.getByUser(req.user.sub);
    return plan ?? { id: null, userId: req.user.sub, days: [] };
  }

  @Put()
  upsertPlan(@Req() req, @Body() body: { days: any[] }) {
    return this.service.upsertPlan(req.user.sub, body.days);
  }

  @Patch('days/:dayId')
  updateDay(@Req() req, @Param('dayId') dayId: string, @Body() body: any) {
    return this.service.updateDay(req.user.sub, dayId, body);
  }

  @Delete('days/:dayId')
  deleteDay(@Req() req, @Param('dayId') dayId: string) {
    return this.service.deleteDay(req.user.sub, dayId);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importExcel(@Req() req, @UploadedFile() file: MulterFile) {
    return this.service.importFromExcel(req.user.sub, file.buffer);
  }

  @Get('template')
  async downloadTemplate(@Res() res: any) {
    const buffer = await this.service.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="gfitness-template.xlsx"',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
