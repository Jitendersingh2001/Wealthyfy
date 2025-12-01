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
}

export const accountService = new AccountService();

