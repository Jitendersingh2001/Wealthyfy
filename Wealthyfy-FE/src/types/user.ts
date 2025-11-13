/**
 * User-related API response types
 */

export interface UserResponse {
  id: number;
  keycloak_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  email_verified: boolean;
  is_setup_complete: boolean;
  status: string;
  phone_number: string | null;
}

