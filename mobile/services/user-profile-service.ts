import api from './api-service';
import { API_ENDPOINTS } from './api-config';

export class UserProfileService {
  static async getUserProfile() {
    try {
      const response = await api.get<any>(API_ENDPOINTS.USER_PROFILE);
      return response;
    } catch (error) {
      console.error('[UserProfileService] Error fetching user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(data: any) {
    try {
      const response = await api.patch<any>(API_ENDPOINTS.USER_PROFILE, data);
      return response;
    } catch (error) {
      console.error('[UserProfileService] Error updating user profile:', error);
      throw error;
    }
  }
}
