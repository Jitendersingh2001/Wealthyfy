export const ERROR_MESSAGES = Object.freeze({
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later.",
  NETWORK_ERROR: "Network connection lost. Check your internet and try again.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  NOT_FOUND: "The requested resource was not found.",
});

/* General app-level common messages */
export const GENERAL_MESSAGES = Object.freeze({
  SUBMITTED_SUCCESSFULLY: "Submitted successfully.",
  LOGOUT_SUCCESSFULLY: "Logged out successfully.",
  LOGIN_SUCCESSFULLY: (fullName: string) =>
    `Hi ${fullName}, you’ve logged in successfully!`,
});

