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

  /**
   * Create or update PAN card and phone number
   * @param phoneNumber - 10-digit mobile number
   * @param pancard - PAN card number
   * @param consent - User consent (Y/N)
   * @param pancardId - Optional PAN card ID for update
   */
  async createPanAndPhoneNo<T = unknown>(
    phoneNumber: string,
    pancard: string,
    consent: string,
    pancardId?: string
  ): Promise<T> {
    const url = ENDPOINTS.USER.CREATE_PAN_AND_PHONE_NO;
    return apiRequest.post<T>(url, {
      phone_number: phoneNumber,
      pancard,
      consent,
      pancard_id: pancardId,
    });
  }

  /**
   * Get user's PAN card details
   */
  async getPancard<T = unknown>(): Promise<T> {
    const url = ENDPOINTS.USER.GET_PANCARD;
    return apiRequest.get<T>(url);
  }

  /**
   * Send OTP to the specified phone number
   * @param phoneNumber - 10-digit mobile number
   */
  async sendOtp<T = unknown>(phoneNumber: string): Promise<T> {
    const url = ENDPOINTS.USER.SEND_OTP;
    return apiRequest.post<T>(url, { phone_number: phoneNumber });
  }

  /**
   * Verify OTP for the specified phone number
   * @param phoneNumber - 10-digit mobile number
   * @param otp - 6-digit OTP code
   */
  async verifyOtp<T = unknown>(phoneNumber: string, otp: string): Promise<T> {
    const url = ENDPOINTS.USER.VERIFY_OTP;
    return apiRequest.post<T>(url, { phone_number: phoneNumber, otp });
  }
}

export const userService = new UserService();
