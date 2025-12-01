import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/custom/data-table";
import { DataTableSkeleton } from "@/components/custom/data-table-skeleton";
import { columns, type Transactions } from "@/constants/dataTableColumns/transactionColumns";
import { transactionService } from "@/services/transactionService";
import { accountService, type DepositAccount } from "@/services/accountService";
import { useServerPagination } from "@/hooks/use-server-pagination";

function DepositsPage() {
  const [accounts, setAccounts] = useState<DepositAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  // Fetch deposit accounts on page load
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoadingAccounts(true);
        // Fetch deposit accounts (type: 'deposit')
        const fetchedAccounts = await accountService.getDepositAccounts("deposit");
        setAccounts(fetchedAccounts);
        
        // Set default account: first account, or account with id=1 if exists, or first account
        if (fetchedAccounts.length > 0) {
          const accountWithId1 = fetchedAccounts.find(acc => acc.id === 1);
          const defaultAccount = accountWithId1 || fetchedAccounts[0];
          setSelectedAccountId(defaultAccount.id);
        }
      } catch (error) {
        console.error("Failed to fetch deposit accounts:", error);
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  const fetchTransactions = useCallback(
    (page: number, size: number, sortBy?: string, sortOrder?: "asc" | "desc") => {
      // Use selected account ID, or fallback to 1 if no account selected
      const accountId = selectedAccountId || 1;
      return transactionService.getTransactions(accountId, page, size, sortBy, sortOrder);
    },
    [selectedAccountId]
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

  if (isLoadingAccounts || isLoading) {
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

