import api from './api-service';
import { API_ENDPOINTS } from './api-config';

export interface Meal {
  id: string;
  name: string;
  totalKcal: number;
  protein: number;
  carbs: number;
  fat: number;
  mealTime: string;
  date: string;
  userId: string;
  items?: any[];
}

export class MealService {
  static async getAllMeals(): Promise<Meal[]> {
    return api.get<Meal[]>(API_ENDPOINTS.GET_MEALS);
  }

  static async getUserMeals(userId: string): Promise<Meal[]> {
    return api.get<Meal[]>(API_ENDPOINTS.GET_USER_MEALS(userId));
  }

  static async getMeal(id: string): Promise<Meal> {
    return api.get<Meal>(API_ENDPOINTS.GET_MEAL(id));
  }

  static async createMeal(data: Omit<Meal, 'id'>): Promise<Meal> {
    return api.post<Meal>(API_ENDPOINTS.CREATE_MEAL, data);
  }

  static async updateMeal(id: string, data: Partial<Meal>): Promise<Meal> {
    return api.patch<Meal>(API_ENDPOINTS.UPDATE_MEAL(id), data);
  }

  static async deleteMeal(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.DELETE_MEAL(id));
  }
}
