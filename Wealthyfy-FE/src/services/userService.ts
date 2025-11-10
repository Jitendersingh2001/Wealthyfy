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

  /**
   * Verify PAN card
   * @param pancard - PAN card number
   * @param consent - User consent (Y/N)
   */
  async verifyPancard<T = unknown>(pancard: string, consent: "Y" | "N" = "Y"): Promise<T> {
    const url = ENDPOINTS.USER.VERIFY_PANCARD;
    return apiRequest.post<T>(url, { pancard, consent });
  }
}

export const userService = new UserService();
