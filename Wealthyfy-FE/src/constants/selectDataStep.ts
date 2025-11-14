import type {
  FiTypeOption,
  ConsentDurationOption,
  FetchTypeOption,
  FrequencyUnitOption,
  SubStep,
} from "@/types/selectDataStep";

export const bankingFiTypes: FiTypeOption[] = [
  { label: "Deposit", value: "DEPOSIT" },
  { label: "Term Deposits", value: "TERM_DEPOSIT" },
];

export const investmentFiTypes: FiTypeOption[] = [
  { label: "Mutual Funds", value: "MUTUAL_FUNDS" },
  { label: "Equity Shares", value: "EQUITIES" },
  { label: "Exchange Traded Funds (ETF)", value: "ETF" },
];

export const consentDurations: ConsentDurationOption[] = [
  { label: "30 Days", value: "30_DAYS" },
  { label: "6 Months", value: "6_MONTHS" },
  { label: "1 Year", value: "1_YEAR" },
  { label: "5 Year", value: "5_YEAR" },
];

export const fetchTypes: FetchTypeOption[] = [
  { label: "One-time", value: "ONETIME", description: "You fetch data once" },
  {
    label: "Periodic",
    value: "PERIODIC",
    description: "You fetch data repeatedly (e.g., monthly)",
  },
];

export const FREQUENCY_UNIT_DAY = "DAY" as const;
export const FREQUENCY_UNIT_MONTH = "MONTH" as const;
export const FREQUENCY_UNIT_YEAR = "YEAR" as const;

export const FREQUENCY_LIMIT_DAY = 30;
export const FREQUENCY_LIMIT_MONTH = 12;
export const FREQUENCY_LIMIT_YEAR = 10;

export const frequencyUnits: FrequencyUnitOption[] = [
  { label: "Day", value: FREQUENCY_UNIT_DAY },
  { label: "Month", value: FREQUENCY_UNIT_MONTH },
  { label: "Year", value: FREQUENCY_UNIT_YEAR },
];

export const SUB_STEPS: SubStep[] = [
  { id: 1, title: "Select Data Types", key: "dataTypes" },
  { id: 2, title: "Select Period", key: "period" },
  { id: 3, title: "Consent Duration", key: "consent" },
  { id: 4, title: "Fetch Type", key: "fetchType" },
];

