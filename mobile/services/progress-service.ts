import api from './api-service';
import { API_ENDPOINTS } from './api-config';

export interface WeeklyProgress {
  id: string;
  weekStart: string;
  weekEnd: string;
  userId: string;
  weight?: number;
  averageCalories?: number;
  averageProtein?: number;
  workoutsCompleted?: number;
  mealsCompleted?: number;
  notes?: string;
}

export class ProgressService {
  static async getAllProgress(): Promise<WeeklyProgress[]> {
    return api.get<WeeklyProgress[]>(API_ENDPOINTS.GET_WEEKLY_PROGRESS);
  }

  static async getUserProgress(userId: string): Promise<WeeklyProgress[]> {
    return api.get<WeeklyProgress[]>(API_ENDPOINTS.GET_USER_WEEKLY_PROGRESS(userId));
  }

  static async getProgress(id: string): Promise<WeeklyProgress> {
    return api.get<WeeklyProgress>(API_ENDPOINTS.GET_PROGRESS(id));
  }

  static async createProgress(data: Omit<WeeklyProgress, 'id'>): Promise<WeeklyProgress> {
    return api.post<WeeklyProgress>(API_ENDPOINTS.CREATE_PROGRESS, data);
  }

  static async updateProgress(id: string, data: Partial<WeeklyProgress>): Promise<WeeklyProgress> {
    return api.patch<WeeklyProgress>(API_ENDPOINTS.UPDATE_PROGRESS(id), data);
  }

  static async deleteProgress(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.DELETE_PROGRESS(id));
  }
}
