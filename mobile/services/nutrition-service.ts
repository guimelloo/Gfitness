import api from './api-service';

interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
}

export class NutritionService {
  /**
   * Search for nutrition data by food query
   * Examples:
   * - "banana"
   * - "2 eggs and 1 cup rice"
   * - "100g chicken breast"
   * - "1 maçã"
   */
  static async searchFood(query: string): Promise<NutritionData[]> {
    try {
      const response = await api.get<NutritionData[]>(
        `/nutrition/search?query=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error) {
      console.error('Error searching nutrition:', error);
      throw error;
    }
  }

  /**
   * Get aggregated nutrition for multiple food items
   * Example: ["2 eggs", "1 banana", "100g chicken"]
   */
  static async aggregateMeal(items: string[]): Promise<NutritionData> {
    try {
      const response = await api.post<NutritionData>(`/nutrition/aggregate`, {
        items,
      });
      return response;
    } catch (error) {
      console.error('Error aggregating nutrition:', error);
      throw error;
    }
  }
}
