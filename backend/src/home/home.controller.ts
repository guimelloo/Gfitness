import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { HomeService } from './home.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  async getHome(@Req() req) {
    return await this.homeService.getHomeData(req.user.sub);
  }
}
