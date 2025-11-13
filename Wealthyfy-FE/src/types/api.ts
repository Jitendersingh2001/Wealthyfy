/**
 * Base API Response Type
 * This type matches the backend ApiResponse structure
 * After axios interceptor transformation, the response structure is:
 * { data: T, message: string | null }
 */
export interface ApiResponse<T> {
  data: T;
  message: string | null;
}
