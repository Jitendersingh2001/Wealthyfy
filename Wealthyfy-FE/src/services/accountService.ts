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
}

export const accountService = new AccountService();

