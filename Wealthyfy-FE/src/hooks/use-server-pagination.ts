import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { getErrorMessage } from "@/utils/errorHelper";
import { ERROR_MESSAGES } from "@/constants/messages";

/**
 * Paginated response from fastapi-pagination
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * Function type for fetching paginated data
 */
export type FetchPaginatedData<T> = (
  page: number,
  size: number,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
) => Promise<PaginatedResponse<T>>;

interface UseServerPaginationOptions<T> {
  /**
   * Function that fetches paginated data from the API
   */
  fetchData: FetchPaginatedData<T>;
  /**
   * Initial page size (default: 10)
   */
  initialPageSize?: number;
  /**
   * Whether to show error toasts (default: true)
   */
  showErrorToast?: boolean;
  /**
   * Custom error message (optional)
   */
  errorMessage?: string;
  /**
   * Initial sorting state (optional)
   */
  initialSorting?: SortingState;
}

interface UseServerPaginationReturn<T> {
  /**
   * The paginated data items
   */
  data: T[];
  /**
   * Loading state
   */
  isLoading: boolean;
  /**
   * Current pagination state
   */
  pagination: PaginationState;
  /**
   * Current sorting state
   */
  sorting: SortingState;
  /**
   * Total number of pages
   */
  pageCount: number;
  /**
   * Total number of records
   */
  total: number;
  /**
   * Handler for pagination changes
   */
  handlePaginationChange: (newPagination: PaginationState) => void;
  /**
   * Handler for sorting changes
   */
  handleSortingChange: (newSorting: SortingState) => void;
  /**
   * Manually refresh the data
   */
  refresh: () => void;
}

/**
 * Custom hook for server-side pagination
 * 
 * @example
 * ```tsx
 * const accountId = 1;
 * 
 * const fetchTransactions = useCallback(
 *   (page: number, size: number) => 
 *     transactionService.getTransactions(accountId, page, size),
 *   [accountId] // Include dependencies here
 * );
 * 
 * const {
 *   data,
 *   isLoading,
 *   pagination,
 *   pageCount,
 *   total,
 *   handlePaginationChange,
 * } = useServerPagination({
 *   fetchData: fetchTransactions,
 *   initialPageSize: 10,
 * });
 * ```
 */
export function useServerPagination<T>({
  fetchData,
  initialPageSize = 10,
  showErrorToast = true,
  errorMessage,
  initialSorting = [],
}: UseServerPaginationOptions<T>): UseServerPaginationReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [sorting, setSorting] = useState<SortingState>(initialSorting || []);
  const [pageCount, setPageCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const fetchPaginatedData = useCallback(
    async (page: number, size: number, sortBy?: string, sortOrder?: "asc" | "desc") => {
      try {
        setIsLoading(true);
        const response = await fetchData(page, size, sortBy, sortOrder);
        setData(response.items || []);
        setPageCount(response.pages || 0);
        setTotal(response.total || 0);
      } catch (error) {
        const errorMsg =
          errorMessage ||
          getErrorMessage(error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        if (showErrorToast) {
          toast.error(errorMsg);
        }
        setData([]);
        setPageCount(0);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchData, showErrorToast, errorMessage]
  );

  useEffect(() => {
    // Get sorting parameters from sorting state
    // SortingState is ColumnSort[] where ColumnSort = { id: string; desc: boolean }
    const firstSort = sorting && sorting.length > 0 ? sorting[0] : null;
    const sortBy = firstSort?.id;
    const sortOrder = firstSort ? (firstSort.desc ? "desc" : "asc") : undefined;
    
    fetchPaginatedData(pagination.pageIndex + 1, pagination.pageSize, sortBy, sortOrder);
  }, [pagination, sorting, fetchPaginatedData]);

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      // If page size changed, reset to first page
      if (newPagination.pageSize !== pagination.pageSize) {
        setPagination({
          pageIndex: 0,
          pageSize: newPagination.pageSize,
        });
      } else {
        setPagination(newPagination);
      }
    },
    [pagination.pageSize]
  );

  const handleSortingChange = useCallback(
    (newSorting: SortingState) => {
      setSorting(newSorting);
      // Reset to first page when sorting changes
      setPagination((prev) => ({
        ...prev,
        pageIndex: 0,
      }));
    },
    []
  );

  const refresh = useCallback(() => {
    // SortingState is ColumnSort[] where ColumnSort = { id: string; desc: boolean }
    const firstSort = sorting.length > 0 ? sorting[0] : null;
    const sortBy = firstSort ? firstSort.id : undefined;
    const sortOrder = firstSort ? (firstSort.desc ? "desc" : "asc") : undefined;
    fetchPaginatedData(pagination.pageIndex + 1, pagination.pageSize, sortBy, sortOrder);
  }, [fetchPaginatedData, pagination.pageIndex, pagination.pageSize, sorting]);

  return {
    data,
    isLoading,
    pagination,
    sorting,
    pageCount,
    total,
    handlePaginationChange,
    handleSortingChange,
    refresh,
  };
}

