import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('workout-plan')
  async generateWorkoutPlan(@Body() userProfile: any) {
    return this.aiService.generateWorkoutPlan(userProfile);
  }

  @Post('analyze')
  async analyzeFitnessData(@Body() data: any) {
    return this.aiService.analyzeFitnessData(data);
  }

  @Post('meal-plan')
  async generateMealPlan(@Body() preferences: any) {
    return this.aiService.generateMealPlan(preferences);
  }
}
