import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { NutritionService, NutritionData } from './nutrition.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

interface SearchNutritionDto {
  query: string;
}

interface AggregateNutritionDto {
  items: string[];
}

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  /**
   * Search for nutrition data for a food
   * Example: /nutrition/search?query=2+eggs+and+1+cup+rice
   */
  @Get('search')
  async search(@Query('query') query: string): Promise<NutritionData[]> {
    if (!query) {
      return [];
    }

    return await this.nutritionService.searchNutrition(query);
  }

  /**
   * Get aggregated nutrition for multiple food items
   * Example: POST /nutrition/aggregate
   * Body: { "items": ["2 eggs", "1 banana", "100g chicken"] }
   */
  @Post('aggregate')
  async aggregate(@Body() dto: AggregateNutritionDto): Promise<NutritionData> {
    if (!dto.items || dto.items.length === 0) {
      return {
        name: 'Meal',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }

    return await this.nutritionService.aggregateMealNutrition(dto.items);
  }
}
