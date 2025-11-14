import { ENDPOINTS } from "@/services/api/endpoints";
import { apiRequest } from "@/services/api/request";
import type { ApiResponse } from "@/types/api";
import type { UserResponse } from "@/types/user";
import type { PanCardResponse } from "@/types/pancard";

class UserService {
  /**
   * Fetch user details by user id
   * @param id - User ID (string or number)
   */
  async getUserById(id: number | string): Promise<ApiResponse<UserResponse>> {
    const url = ENDPOINTS.USER.GET_USER(id);
    return apiRequest.get<ApiResponse<UserResponse>>(url);
  }

  /**
   * Verify PAN card
   * @param pancard - PAN card number
   * @param consent - User consent (Y/N)
   */
  async verifyPancard(pancard: string, consent: "Y" | "N" = "Y"): Promise<ApiResponse<string>> {
    const url = ENDPOINTS.USER.VERIFY_PANCARD;
    return apiRequest.post<ApiResponse<string>>(url, { pancard, consent });
  }

  /**
   * Create or update PAN card and phone number
   * @param phoneNumber - 10-digit mobile number
   * @param pancard - PAN card number
   * @param consent - User consent (Y/N)
   * @param pancardId - Optional PAN card ID for update
   */
  async createPanAndPhoneNo(
    phoneNumber: string,
    pancard: string,
    consent: string,
    pancardId?: string
  ): Promise<ApiResponse<boolean>> {
    const url = ENDPOINTS.USER.CREATE_PAN_AND_PHONE_NO;
    return apiRequest.post<ApiResponse<boolean>>(url, {
      phone_number: phoneNumber,
      pancard,
      consent,
      pancard_id: pancardId,
    });
  }

  /**
   * Get user's PAN card details
   */
  async getPancard(): Promise<ApiResponse<PanCardResponse>> {
    const url = ENDPOINTS.USER.GET_PANCARD;
    return apiRequest.get<ApiResponse<PanCardResponse>>(url);
  }

  /**
   * Send OTP to the specified phone number
   * @param phoneNumber - 10-digit mobile number
   */
  async sendOtp(phoneNumber: string): Promise<ApiResponse<string>> {
    const url = ENDPOINTS.USER.SEND_OTP;
    return apiRequest.post<ApiResponse<string>>(url, { phone_number: phoneNumber });
  }

  /**
   * Verify OTP for the specified phone number
   * @param phoneNumber - 10-digit mobile number
   * @param otp - 6-digit OTP code
   */
  async verifyOtp(phoneNumber: string, otp: string): Promise<ApiResponse<boolean>> {
    const url = ENDPOINTS.USER.VERIFY_OTP;
    return apiRequest.post<ApiResponse<boolean>>(url, { phone_number: phoneNumber, otp });
  }

  /**
   * Link bank account by creating consent
   * @param payload - Link bank request payload
   */
  async linkBank(payload: {
    start_date: string;
    end_date: string;
    fi_type: string[];
    consent_duration: { unit: string; value: string };
    fetch_type: string;
    frequency?: { unit: string; value: string };
  }): Promise<ApiResponse<string>> {
    const url = ENDPOINTS.USER.LINK_BANK;
    return apiRequest.post<ApiResponse<string>>(url, payload);
  }
}

export const userService = new UserService();
