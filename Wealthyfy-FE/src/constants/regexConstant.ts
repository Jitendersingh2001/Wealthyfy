export const REGEX = Object.freeze({
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  MOBILE_REGEX: /^[0-9]{10}$/,
  NON_ALPHANUMERIC_PAN_CHARS_REGEX: /[^A-Za-z0-9]/g,
    ONLY_DIGITS_REGEX: /^\d+$/,
   NON_DIGITS_REGEX: /\D/g,
});
