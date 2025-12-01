import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/custom/data-table";
import { DataTableSkeleton } from "@/components/custom/data-table-skeleton";
import { BankAccountCard } from "@/components/custom/bank-account-card";
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
        
        // Set default account: first account in the array (index 0)
        if (fetchedAccounts.length > 0) {
          setSelectedAccountId(fetchedAccounts[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch deposit accounts:", error);
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleAccountChange = useCallback((accountId: number) => {
    setSelectedAccountId(accountId);
  }, []);

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

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

  if (isLoadingAccounts) {
    return (
      <div className="relative w-full">
        <div className="p-6">
          <div className="flex gap-6 items-start">
            <div className="flex-1">
              <DataTableSkeleton columnCount={columns.length} rowCount={10} />
            </div>
            <div className="flex-shrink-0">
              <div className="h-64 w-[320px] bg-muted animate-pulse rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedAccount) {
    return (
      <div className="relative w-full">
        <div className="p-6">
          <p className="text-muted-foreground">No account selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="p-6">
        <div className="flex gap-6 items-start">
          {/* Transactions Table */}
          <div className="flex-1">
            {isLoading ? (
              <DataTableSkeleton columnCount={columns.length} rowCount={pagination.pageSize} />
            ) : (
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
            )}
          </div>

          {/* Bank Account Card */}
          <div className="flex-shrink-0">
            <BankAccountCard
              account={selectedAccount}
              accounts={accounts}
              onAccountChange={handleAccountChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepositsPage;

