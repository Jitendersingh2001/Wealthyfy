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

/**
 * API Error Type
 * Represents the error structure returned by the API
 */
export interface ApiError {
  data?: {
    detail?: string;
    message?: string;
  };
}
