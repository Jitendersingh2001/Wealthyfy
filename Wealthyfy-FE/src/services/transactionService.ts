import { ENDPOINTS } from "@/services/api/endpoints";
import { apiRequest } from "@/services/api/request";
import type { Transactions } from "@/constants/dataTableColumns/transactionColumns";
import type { ApiResponse } from "@/types/api";
import type { PaginatedResponse } from "@/hooks/use-server-pagination";

class TransactionService {
  /**
   * Fetch paginated transactions for a given account ID
   * @param accountId - Account ID (default: 1)
   * @param page - Page number (default: 1)
   * @param size - Page size (default: 100 to fetch more data for client-side pagination)
   * @param sortBy - Field name to sort by (optional)
   * @param sortOrder - Sort order: 'asc' or 'desc' (optional)
   */
  async getTransactions(
    accountId: number = 1,
    page: number = 1,
    size: number = 100,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<PaginatedResponse<Transactions>> {
    const url = ENDPOINTS.TRANSACTIONS.GET_TRANSACTIONS();
    const payload: {
      account_id: number;
      page: number;
      size: number;
      sort_by?: string;
      sort_order?: "asc" | "desc";
    } = {
      account_id: accountId,
      page,
      size,
    };
    
    // Add sorting parameters if provided
    if (sortBy) {
      payload.sort_by = sortBy;
    }
    if (sortOrder) {
      payload.sort_order = sortOrder;
    }
    
    // fastapi-pagination returns Page object directly, but axios interceptor wraps it
    // So we get ApiResponse<PaginatedResponse<Transactions>>
    const response = await apiRequest.post<ApiResponse<PaginatedResponse<Transactions>>>(url, payload);
    // Return the actual paginated data
    return response.data;
  }
}

export const transactionService = new TransactionService();

