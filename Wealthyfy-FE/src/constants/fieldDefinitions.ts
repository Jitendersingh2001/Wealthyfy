/* Field definitions with validation constraints */
export const FIELD_NAMES = Object.freeze({
  PAN_NUMBER: {
    name: "PAN number",
    length: 10,
    unit: "characters" as const,
  },
  MOBILE_NUMBER: {
    name: "Mobile number",
    length: 10,
    unit: "digits" as const,
  },
  CONSENT: {
    name: "Consent",
  },
  OTP: {
    name: "OTP",
    length: 6,
    unit: "digits" as const,
  },
});

