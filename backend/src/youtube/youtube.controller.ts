import { Controller, Get, Query, Param } from '@nestjs/common';
import { YoutubeService } from './youtube.service';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    return this.youtubeService.searchVideos(query);
  }

  @Get('video/:id')
  async getVideo(@Param('id') videoId: string) {
    return this.youtubeService.getVideoDetails(videoId);
  }
}
