import api from './api-service';
import { API_ENDPOINTS } from './api-config';

export interface Workout {
  id: string;
  title: string;
  description?: string;
  date: string;
  userId: string;
  exercises?: any[];
}

export class WorkoutService {
  static async getAllWorkouts(): Promise<Workout[]> {
    return api.get<Workout[]>(API_ENDPOINTS.GET_WORKOUTS);
  }

  static async getUserWorkouts(userId: string): Promise<Workout[]> {
    return api.get<Workout[]>(API_ENDPOINTS.GET_USER_WORKOUTS(userId));
  }

  static async getWorkout(id: string): Promise<Workout> {
    return api.get<Workout>(API_ENDPOINTS.GET_WORKOUT(id));
  }

  static async createWorkout(data: Omit<Workout, 'id'>): Promise<Workout> {
    return api.post<Workout>(API_ENDPOINTS.CREATE_WORKOUT, data);
  }

  static async updateWorkout(id: string, data: Partial<Workout>): Promise<Workout> {
    return api.patch<Workout>(API_ENDPOINTS.UPDATE_WORKOUT(id), data);
  }

  static async deleteWorkout(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.DELETE_WORKOUT(id));
  }
}
