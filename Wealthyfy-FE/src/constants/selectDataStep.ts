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
  { label: "Bonds", value: "BONDS" },
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

export const frequencyUnits: FrequencyUnitOption[] = [
  { label: "Day", value: "DAY" },
  { label: "Month", value: "MONTH" },
  { label: "Year", value: "YEAR" },
];

export const SUB_STEPS: SubStep[] = [
  { id: 1, title: "Select Data Types", key: "dataTypes" },
  { id: 2, title: "Select Period", key: "period" },
  { id: 3, title: "Consent Duration", key: "consent" },
  { id: 4, title: "Fetch Type", key: "fetchType" },
];

