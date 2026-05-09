import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
  serving_size_g?: number;
}

@Injectable()
export class NutritionService {
  private apiKey = process.env.NUTRITION_API_KEY || 'default_key';
  private readonly NINJA_API_URL = 'https://api.api-ninjas.com/v1/nutrition';

  constructor(private prisma: PrismaService) {}

  /**
   * Search for food nutrition data
   * Can accept queries like: "2 eggs and 1 cup rice", "banana 100g", "chicken breast"
   */
  async searchNutrition(query: string): Promise<NutritionData[]> {
    try {
      console.log('[Nutrition] Searching for:', query);

      // Try to get from cache first
      const cached = await this.prisma.nutritionCache.findFirst({
        where: {
          query: query.toLowerCase(),
        },
      });

      if (cached) {
        console.log('[Nutrition] Found in cache');
        return JSON.parse(cached.data);
      }

      // If API key is default_key (invalid), use mock data for testing
      if (this.apiKey === 'default_key') {
        console.log('[Nutrition] Using mock data (no valid API key)');
        const mockData = this.getMockNutritionData(query);
        // Cache mock data too
        await this.prisma.nutritionCache.create({
          data: {
            query: query.toLowerCase(),
            data: JSON.stringify(mockData),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        }).catch(() => {}); // Ignore cache errors
        return mockData;
      }

      // Call API Ninjas
      const response = await fetch(
        `${this.NINJA_API_URL}?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'X-Api-Key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        console.error(`[Nutrition] API error: ${response.status}`);
        // Fallback to mock data on API error
        const mockData = this.getMockNutritionData(query);
        return mockData;
      }

      const data = await response.json();

      // Transform API response to our format
      const nutritionData = data.map((item: any) => ({
        name: item.name || query,
        calories: Math.round(item.calories || 0),
        protein: Math.round(item.protein_g || 0),
        carbs: Math.round(item.carbohydrates_g || 0),
        fat: Math.round(item.fat_total_g || 0),
        fiber: item.fiber_g ? Math.round(item.fiber_g) : undefined,
        sugar: item.sugar_g ? Math.round(item.sugar_g) : undefined,
        serving_size_g: item.serving_size_g,
      }));

      // Cache the result
      await this.prisma.nutritionCache.create({
        data: {
          query: query.toLowerCase(),
          data: JSON.stringify(nutritionData),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      console.log('[Nutrition] Found from API:', nutritionData);
      return nutritionData;
    } catch (error) {
      console.error('[Nutrition] Error searching:', error);
      throw error;
    }
  }

  /**
   * Get aggregated nutrition for a complete meal
   * Sums up nutrition data for multiple food items
   */
  async aggregateMealNutrition(foodItems: string[]): Promise<NutritionData> {
    try {
      const results = await Promise.all(
        foodItems.map((item) => this.searchNutrition(item))
      );

      // Flatten results and aggregate
      const allItems = results.flat();

      const total = {
        name: 'Meal',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
      };

      allItems.forEach((item) => {
        total.calories += item.calories;
        total.protein += item.protein;
        total.carbs += item.carbs;
        total.fat += item.fat;
        if (item.fiber) total.fiber += item.fiber;
        if (item.sugar) total.sugar += item.sugar;
      });

      return {
        ...total,
        fiber: total.fiber || undefined,
        sugar: total.sugar || undefined,
      };
    } catch (error) {
      console.error('[Nutrition] Error aggregating:', error);
      throw error;
    }
  }

  /**
   * Clear old cached data (run periodically)
   */
  async clearExpiredCache() {
    try {
      const deleted = await this.prisma.nutritionCache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      console.log('[Nutrition] Cleared', deleted.count, 'expired cache entries');
      return deleted;
    } catch (error) {
      console.error('[Nutrition] Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Get mock nutrition data for testing when API key is invalid
   */
  private getMockNutritionData(query: string): NutritionData[] {
    const mockDatabase: { [key: string]: NutritionData } = {
      'banana': {
        name: 'Banana',
        calories: 89,
        protein: 1.1,
        carbs: 23,
        fat: 0.3,
        fiber: 2.6,
        sugar: 12,
      },
      'egg': {
        name: 'Egg',
        calories: 155,
        protein: 13,
        carbs: 1.1,
        fat: 11,
        fiber: 0,
        sugar: 1.1,
      },
      'chicken': {
        name: 'Chicken breast',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        sugar: 0,
      },
      'rice': {
        name: 'Rice (cooked)',
        calories: 130,
        protein: 2.7,
        carbs: 28,
        fat: 0.3,
        fiber: 0.4,
        sugar: 0,
      },
      'bread': {
        name: 'Bread',
        calories: 265,
        protein: 9,
        carbs: 49,
        fat: 3.3,
        fiber: 2.7,
        sugar: 4.3,
      },
      'milk': {
        name: 'Milk',
        calories: 61,
        protein: 3.2,
        carbs: 4.8,
        fat: 3.3,
        fiber: 0,
        sugar: 4.8,
      },
      'apple': {
        name: 'Apple',
        calories: 52,
        protein: 0.3,
        carbs: 14,
        fat: 0.2,
        fiber: 2.4,
        sugar: 10,
      },
      'broccoli': {
        name: 'Broccoli',
        calories: 34,
        protein: 2.8,
        carbs: 7,
        fat: 0.4,
        fiber: 2.4,
        sugar: 1.4,
      },
    };

    // Try to find a match in mock database
    const normalized = query.toLowerCase();
    for (const [key, value] of Object.entries(mockDatabase)) {
      if (normalized.includes(key)) {
        return [value];
      }
    }

    // Return generic mock data if no match found
    return [{
      name: query,
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 2,
      fiber: 2,
      sugar: 8,
    }];
  }
}

