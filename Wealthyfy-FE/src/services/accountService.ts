import { ENDPOINTS } from "@/services/api/endpoints";
import { apiRequest } from "@/services/api/request";
import type { ApiResponse } from "@/types/api";

export interface AccountHolder {
  name: string;
}

export interface DepositAccount {
  id: number;
  masked_account_number: string | null;
  holders: AccountHolder[];
}

export interface AccountDetails {
  holder_type: string | null;
  ckyc_compliance: boolean | null;
  date_of_birth: string | null;
  email: string | null;
  mobile: string | null;
  nominee_status: string | null;
  pan: string | null;
  branch: string | null;
  ifsc_code: string | null;
}

export interface AccountMetrics {
  current_balance: number | null;
  last_month_total_credit: number;
  last_month_total_debit: number;
}

export interface PaymentTypeStatistic {
  mode: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface PaymentTypeStatistics {
  payment_types: PaymentTypeStatistic[];
  total_amount: number;
}

export interface MonthlyCreditDebitData {
  month: string;
  credit: number;
  debit: number;
}

export interface MonthlyCreditDebitStatistics {
  available_years: number[];
  monthly_data: MonthlyCreditDebitData[];
}

class AccountService {
  /**
   * Fetch deposit accounts for the authenticated user
   * @param type - Required account type filter: 'deposit' or 'term_deposit'
   */
  async getDepositAccounts(
    type: "deposit" | "term_deposit"
  ): Promise<DepositAccount[]> {
    const url = ENDPOINTS.ACCOUNTS.GET_DEPOSIT_ACCOUNTS(type);
    const response = await apiRequest.get<ApiResponse<DepositAccount[]>>(url);
    return response.data || [];
  }

  /**
   * Fetch account details for a specific account
   * @param accountId - The account ID to fetch details for
   */
  async getAccountDetails(accountId: number): Promise<AccountDetails> {
    const url = ENDPOINTS.ACCOUNTS.GET_ACCOUNT_DETAILS(accountId);
    const response = await apiRequest.get<ApiResponse<AccountDetails>>(url);
    return response.data || {} as AccountDetails;
  }

  /**
   * Fetch account metrics for a specific account
   * @param accountId - The account ID to fetch metrics for
   */
  async getAccountMetrics(accountId: number): Promise<AccountMetrics> {
    const url = ENDPOINTS.ACCOUNTS.GET_ACCOUNT_METRICS(accountId);
    const response = await apiRequest.get<ApiResponse<AccountMetrics>>(url);
    return response.data || {
      current_balance: null,
      last_month_total_credit: 0,
      last_month_total_debit: 0,
    };
  }

  /**
   * Fetch payment type statistics for a specific account
   * @param accountId - The account ID to fetch payment statistics for
   */
  async getPaymentStatistics(accountId: number): Promise<PaymentTypeStatistics> {
    const url = ENDPOINTS.ACCOUNTS.GET_PAYMENT_STATISTICS(accountId);
    const response = await apiRequest.get<ApiResponse<PaymentTypeStatistics>>(url);
    return response.data || {
      payment_types: [],
      total_amount: 0,
    };
  }

  /**
   * Fetch monthly credit/debit statistics for a specific account
   * @param accountId - The account ID to fetch monthly statistics for
   * @param year - Optional year to filter by. If not provided, returns available years only.
   */
  async getMonthlyStatistics(
    accountId: number,
    year?: number
  ): Promise<MonthlyCreditDebitStatistics> {
    const url = ENDPOINTS.ACCOUNTS.GET_MONTHLY_STATISTICS(accountId, year);
    const response = await apiRequest.get<ApiResponse<MonthlyCreditDebitStatistics>>(url);
    return response.data || {
      available_years: [],
      monthly_data: [],
    };
  }
}

export const accountService = new AccountService();

