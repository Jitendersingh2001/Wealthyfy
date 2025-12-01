import { z } from "zod";
import { REGEX } from "@/constants/regexConstant";
import { VALIDATION_ERROR_MESSAGES } from "@/constants/messages";
import { FIELD_NAMES } from "@/constants/fieldDefinitions";

/**
 * Common validation schemas for reusable form fields
 */

/**
 * PAN number validation schema
 * Validates PAN format, length, and transforms to uppercase
 */
export const panValidation = z
  .string()
  .min(1, VALIDATION_ERROR_MESSAGES.IS_REQUIRED(FIELD_NAMES.PAN_NUMBER.name))
  .length(
    FIELD_NAMES.PAN_NUMBER.length,
    VALIDATION_ERROR_MESSAGES.MUST_HAVE_EXACT_LENGTH(
      FIELD_NAMES.PAN_NUMBER.name,
      FIELD_NAMES.PAN_NUMBER.length,
      FIELD_NAMES.PAN_NUMBER.unit
    )
  )
  .regex(REGEX.PAN_REGEX, VALIDATION_ERROR_MESSAGES.INVALID_FORMAT(FIELD_NAMES.PAN_NUMBER.name))
  .transform((v) => v.toUpperCase().replace(REGEX.NON_ALPHANUMERIC_PAN_CHARS_REGEX, ""));

/**
 * Mobile number validation schema
 * Validates mobile format, length, and ensures only digits
 */
export const mobileValidation = z
  .string()
  .min(1, VALIDATION_ERROR_MESSAGES.IS_REQUIRED(FIELD_NAMES.MOBILE_NUMBER.name))
  .length(
    FIELD_NAMES.MOBILE_NUMBER.length,
    VALIDATION_ERROR_MESSAGES.MUST_HAVE_EXACT_LENGTH(
      FIELD_NAMES.MOBILE_NUMBER.name,
      FIELD_NAMES.MOBILE_NUMBER.length,
      FIELD_NAMES.MOBILE_NUMBER.unit
    )
  )
  .regex(
    REGEX.MOBILE_REGEX,
    VALIDATION_ERROR_MESSAGES.MUST_CONTAIN_ONLY(FIELD_NAMES.MOBILE_NUMBER.name, FIELD_NAMES.MOBILE_NUMBER.unit)
  )
  .transform((v) => v.replace(REGEX.NON_DIGITS_REGEX, ""));

/**
 * OTP validation schema
 * Validates OTP format, length, and ensures only digits
 */
export const otpValidation = z
  .string()
  .regex(
    REGEX.ONLY_DIGITS_REGEX,
    VALIDATION_ERROR_MESSAGES.MUST_CONTAIN_ONLY(FIELD_NAMES.OTP.name, FIELD_NAMES.OTP.unit)
  )
  .length(
    FIELD_NAMES.OTP.length,
    VALIDATION_ERROR_MESSAGES.MUST_HAVE_EXACT_LENGTH(
      FIELD_NAMES.OTP.name,
      FIELD_NAMES.OTP.length,
      FIELD_NAMES.OTP.unit
    )
  )
  .transform((v) => v.trim());

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'INR')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "INR"
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

