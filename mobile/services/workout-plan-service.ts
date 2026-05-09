import api from './api-service';
import { API_BASE_URL } from './api-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorkoutPlanExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  note?: string;
  order: number;
}

export interface WorkoutPlanDay {
  id: string;
  dayOfWeek: number;
  dayName: string;
  muscleGroups: string;
  exercises: WorkoutPlanExercise[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  days: WorkoutPlanDay[];
}

export class WorkoutPlanService {
  static async getMyPlan(): Promise<WorkoutPlan | null> {
    try {
      return await api.get<WorkoutPlan>('/workout-plans');
    } catch {
      return null;
    }
  }

  static async upsertPlan(days: Omit<WorkoutPlanDay, 'id'>[]): Promise<WorkoutPlan> {
    return api.post<WorkoutPlan>('/workout-plans', { days });
  }

  static async updateDay(dayId: string, data: Partial<WorkoutPlanDay>): Promise<WorkoutPlanDay> {
    return api.patch<WorkoutPlanDay>(`/workout-plans/days/${dayId}`, data);
  }

  static async deleteDay(dayId: string): Promise<void> {
    await api.delete(`/workout-plans/days/${dayId}`);
  }

  static async importExcel(fileUri: string, fileName: string, mimeType: string): Promise<{ message: string; workoutDaysImported: number; mealsImported: number }> {
    const token = await AsyncStorage.getItem('userToken');
    const formData = new FormData();
    formData.append('file', { uri: fileUri, name: fileName, type: mimeType } as any);

    const response = await fetch(`${API_BASE_URL}/workout-plans/import`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }
    return response.json();
  }

  static async uploadAvatar(fileUri: string, fileName: string, mimeType: string): Promise<{ avatarUrl: string }> {
    const token = await AsyncStorage.getItem('userToken');
    const formData = new FormData();
    formData.append('file', { uri: fileUri, name: fileName, type: mimeType } as any);

    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }
    return response.json();
  }

  static getTemplateUrl(): string {
    return `${API_BASE_URL}/workout-plans/template`;
  }
}
