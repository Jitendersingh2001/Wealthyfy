import { ENDPOINTS } from "@/services/api/endpoints";
import { apiRequest } from "@/services/api/request";

class UserService {
  /**
   * Fetch user details by user id
   * @param id - User ID (string or number)
   */
  async getUserById<T = unknown>(id: number | string): Promise<T> {
    const url = ENDPOINTS.USER.GET_USER(id);
    return apiRequest.get<T>(url);
  }
}

export const userService = new UserService();
