import type { ApiError } from "@/types/api";

/**
 * Extracts error message from API error response
 * Checks for detail first, then message, then falls back to default
 * @param error - The error object from catch block
 * @param defaultMessage - Fallback message if no error message is found
 * @returns The error message string
 */
export const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  const apiError = error as ApiError;
  return apiError?.data?.detail || apiError?.data?.message || defaultMessage;
};

