import { ENDPOINTS } from "@/services/api/endpoints";
import { apiRequest } from "@/services/api/request";
import type { ApiResponse } from "@/types/api";

export interface DepositAccount {
  id: number;
  consent_id: number;
  fip_id: string;
  link_ref_number: string;
  masked_account_number: string | null;
  account_type: "DEPOSIT" | "TERM_DEPOSIT";
  created_at: string;
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

