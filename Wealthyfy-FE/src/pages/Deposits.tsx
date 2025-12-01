import { useCallback } from "react";
import { DataTable } from "@/components/custom/data-table";
import { DataTableSkeleton } from "@/components/custom/data-table-skeleton";
import { columns, type Transactions } from "@/constants/dataTableColumns/transactionColumns";
import { transactionService } from "@/services/transactionService";
import { useServerPagination } from "@/hooks/use-server-pagination";

function DepositsPage() {
  // For now, using static account_id = 1 as per requirements
  const accountId = 1;

  const fetchTransactions = useCallback(
    (page: number, size: number, sortBy?: string, sortOrder?: "asc" | "desc") =>
      transactionService.getTransactions(accountId, page, size, sortBy, sortOrder),
    [accountId]
  );

  const {
    data: transactions,
    isLoading,
    pagination,
    sorting,
    pageCount,
    total,
    handlePaginationChange,
    handleSortingChange,
  } = useServerPagination<Transactions>({
    fetchData: fetchTransactions,
    initialPageSize: 10,
    initialSorting: [{ id: "transaction_timestamp", desc: true }],
  });

  if (isLoading) {
    return (
      <div className="relative w-full">
        <div className="p-6">
          <DataTableSkeleton columnCount={columns.length} rowCount={pagination.pageSize} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="p-6">
        <DataTable
          columns={columns}
          data={transactions}
          initialSorting={[{ id: "transaction_timestamp", desc: true }]}
          initialPageSize={pagination.pageSize}
          pageCount={pageCount}
          total={total}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          manualPagination={true}
          sorting={sorting}
          onSortingChange={(updater) => {
            const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
            handleSortingChange(newSorting);
          }}
          manualSorting={true}
        />
      </div>
    </div>
  );
}

export default DepositsPage;

