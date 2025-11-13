export const ERROR_MESSAGES = Object.freeze({
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later.",
  NETWORK_ERROR: "Network connection lost. Check your internet and try again.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  NOT_FOUND: "The requested resource was not found.",
  FAILED_TO_SEND_OTP: "Failed to send OTP",
  FAILED_TO_RESEND_OTP: "Failed to resend OTP",
  INVALID_OR_EXPIRED_OTP: "Invalid or expired OTP",
  FAILED_TO_VERIFY_PAN: "Failed to verify PAN card",
  FAILED_TO_SAVE_PAN_AND_PHONE: "Failed to save PAN and phone number",
  FAILED_TO_LINK_BANK_ACCOUNT: "Failed to link bank account",
});

/* Validation error messages */
export const VALIDATION_ERROR_MESSAGES = Object.freeze({
  IS_REQUIRED: (name: string) => `${name} is required.`,
  MUST_HAVE_EXACT_LENGTH: (name: string, length: number, unit: string = "characters") =>
    `${name} must be exactly ${length} ${unit}.`,
  INVALID_FORMAT: (name: string, example?: string) =>
    example ? `Invalid ${name} format (e.g., ${example})` : `Invalid ${name} format.`,
  MUST_CONTAIN_ONLY: (name: string, type: string) => `${name} must contain only ${type}.`,
});

/* General app-level common messages */
export const GENERAL_MESSAGES = Object.freeze({
  SUBMITTED_SUCCESSFULLY: "Submitted successfully.",
  LOGOUT_SUCCESSFULLY: "Logged out successfully.",
  LOGIN_SUCCESSFULLY: (fullName: string) =>
    `Hi ${fullName}, you've logged in successfully!`,
  VERIFIED_SUCCESSFULLY: (name: string) => `${name} verified successfully.`,
  SENT_SUCCESSFULLY: (name: string) => `${name} sent successfully.`,
  RESENT_SUCCESSFULLY: (name: string) => `${name} resent successfully.`,
});

