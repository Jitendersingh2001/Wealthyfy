export type FiType = "DEPOSIT" | "TERM_DEPOSIT" | "MUTUAL_FUNDS" | "BONDS" | "EQUITIES" | "ETF";

export type ConsentDuration = "30_DAYS" | "6_MONTHS" | "1_YEAR" | "5_YEAR";

export type FetchType = "ONETIME" | "PERIODIC";

export type FrequencyUnit = "DAY" | "MONTH" | "YEAR";

export interface FiTypeOption {
  label: string;
  value: FiType;
}

export interface ConsentDurationOption {
  label: string;
  value: ConsentDuration;
}

export interface FetchTypeOption {
  label: string;
  value: FetchType;
  description: string;
}

export interface FrequencyUnitOption {
  label: string;
  value: FrequencyUnit;
}

export interface SubStep {
  id: number;
  title: string;
  key: string;
}

