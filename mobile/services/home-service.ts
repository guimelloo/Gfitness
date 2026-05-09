import api from './api-service';
import { API_ENDPOINTS } from './api-config';

export class HomeService {
  static async getHomeData() {
    try {
      const response = await api.get<any>(API_ENDPOINTS.HOME);
      return response;
    } catch (error) {
      console.error('Error fetching home data:', error);
      throw error;
    }
  }
}

export class DailyLogService {
  static async createDailyLog(data: {
    date: string;
    weight?: number;
    workoutCompleted?: boolean;
    workoutType?: string;
    waterIntake?: number;
    notes?: string;
  }) {
    try {
      const response = await api.post<any>(API_ENDPOINTS.DAILY_LOG_CREATE, data);
      return response;
    } catch (error) {
      console.error('Error creating daily log:', error);
      throw error;
    }
  }

  static async getTodayLog() {
    try {
      const response = await api.get<any>(API_ENDPOINTS.DAILY_LOG_TODAY);
      return response;
    } catch (error) {
      console.error('Error fetching today log:', error);
      throw error;
    }
  }

  static async updateDailyLog(date: string, data: any) {
    try {
      const response = await api.patch<any>(
        `${API_ENDPOINTS.DAILY_LOG_UPDATE}${date}`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error updating daily log:', error);
      throw error;
    }
  }

  static async getRecentLogs(days: number = 30) {
    try {
      const response = await api.get<any>(
        `${API_ENDPOINTS.DAILY_LOG_RECENT}?days=${days}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching recent logs:', error);
      throw error;
    }
  }

  static async addMeal(mealData: {
    mealName: string;
    totalKcal: number;
    protein: number;
    carbs: number;
    fat: number;
    date?: string;
  }) {
    try {
      const response = await api.post<any>(
        API_ENDPOINTS.DAILY_LOG_ADD_MEAL,
        mealData
      );
      return response;
    } catch (error) {
      console.error('Error adding meal:', error);
      throw error;
    }
  }

  static async removeMeal(mealLogId: string) {
    try {
      const response = await api.delete<any>(
        API_ENDPOINTS.DAILY_LOG_REMOVE_MEAL(mealLogId)
      );
      return response;
    } catch (error) {
      console.error('Error removing meal:', error);
      throw error;
    }
  }

  static async deleteTodayLog() {
    try {
      // Get today's log first to get its date
      const todayLog = await this.getTodayLog();
      
      if (todayLog && todayLog.id) {
        // Delete by ID - we need a delete endpoint
        // Assuming DELETE /daily-logs/:id exists
        const response = await api.delete<any>(`/daily-logs/${todayLog.id}`);
        return response;
      }
      
      throw new Error('No log found for today');
    } catch (error) {
      console.error('Error deleting today log:', error);
      throw error;
    }
  }
}
