import api from './api-service';
import { API_ENDPOINTS } from './api-config';

export interface Checkin {
  id: string;
  weight: number;
  bodyFat?: number;
  notes?: string;
  createdAt: string;
  userId: string;
}

export class CheckinService {
  static async getAllCheckins(): Promise<Checkin[]> {
    return api.get<Checkin[]>(API_ENDPOINTS.GET_CHECKINS);
  }

  static async getUserCheckins(userId: string): Promise<Checkin[]> {
    return api.get<Checkin[]>(API_ENDPOINTS.GET_USER_CHECKINS(userId));
  }

  static async getCheckin(id: string): Promise<Checkin> {
    return api.get<Checkin>(API_ENDPOINTS.GET_CHECKIN(id));
  }

  static async createCheckin(data: Omit<Checkin, 'id' | 'createdAt'>): Promise<Checkin> {
    return api.post<Checkin>(API_ENDPOINTS.CREATE_CHECKIN, data);
  }

  static async updateCheckin(id: string, data: Partial<Checkin>): Promise<Checkin> {
    return api.patch<Checkin>(API_ENDPOINTS.UPDATE_CHECKIN(id), data);
  }

  static async deleteCheckin(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.DELETE_CHECKIN(id));
  }
}
