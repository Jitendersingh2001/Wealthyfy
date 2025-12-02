import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/custom/data-table";
import { DataTableSkeleton } from "@/components/custom/data-table-skeleton";
import { BankAccountCard } from "@/components/custom/bank-account-card";
import { AccountDetailsCard } from "@/components/custom/account-details-card";
import { MonitoringCards, type MonitoringCardItem } from "@/components/custom/monitoring-cards";
import { PaymentTypeChart } from "@/components/custom/payment-type-chart";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { columns, type Transactions } from "@/constants/dataTableColumns/transactionColumns";
import { transactionService } from "@/services/transactionService";
import { accountService, type DepositAccount, type AccountDetails, type AccountMetrics, type PaymentTypeStatistics } from "@/services/accountService";
import { useServerPagination } from "@/hooks/use-server-pagination";

function DepositsPage() {
  const [accounts, setAccounts] = useState<DepositAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [accountMetrics, setAccountMetrics] = useState<AccountMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [paymentStatistics, setPaymentStatistics] = useState<PaymentTypeStatistics | null>(null);
  const [isLoadingPaymentStats, setIsLoadingPaymentStats] = useState(false);

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
    // Reset account details and metrics when account changes
    setAccountDetails(null);
    setAccountMetrics(null);
  }, []);

  // Fetch account details when "Show Details" is clicked
  const handleShowDetails = useCallback(async () => {
    if (!selectedAccountId) {
      return;
    }

    // Only fetch if details haven't been loaded yet
    if (accountDetails) {
      return;
    }

    try {
      setIsLoadingDetails(true);
      const details = await accountService.getAccountDetails(selectedAccountId);
      setAccountDetails(details);
    } catch (error) {
      console.error("Failed to fetch account details:", error);
      setAccountDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [selectedAccountId, accountDetails]);

  // Fetch account metrics when account is selected
  useEffect(() => {
    const fetchAccountMetrics = async () => {
      if (!selectedAccountId) {
        setAccountMetrics(null);
        return;
      }

      try {
        setIsLoadingMetrics(true);
        const metrics = await accountService.getAccountMetrics(selectedAccountId);
        setAccountMetrics(metrics);
      } catch (error) {
        console.error("Failed to fetch account metrics:", error);
        setAccountMetrics(null);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchAccountMetrics();
  }, [selectedAccountId]);

  // Fetch payment statistics when account is selected
  useEffect(() => {
    const fetchPaymentStatistics = async () => {
      if (!selectedAccountId) {
        setPaymentStatistics(null);
        return;
      }

      try {
        setIsLoadingPaymentStats(true);
        const stats = await accountService.getPaymentStatistics(selectedAccountId);
        setPaymentStatistics(stats);
      } catch (error) {
        console.error("Failed to fetch payment statistics:", error);
        setPaymentStatistics(null);
      } finally {
        setIsLoadingPaymentStats(false);
      }
    };

    fetchPaymentStatistics();
  }, [selectedAccountId]);

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  // Format currency helper
  const formatCurrency = (value: string | number | null) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "string") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return "N/A";
      value = numValue;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Prepare monitoring cards data
  const monitoringCards: MonitoringCardItem[] = [
    {
      title: "Current Balance",
      value: accountMetrics?.current_balance ?? null,
      icon: Wallet,
      iconColor: "text-muted-foreground",
      formatValue: formatCurrency,
    },
    {
      title: "Last Month Credit",
      value: accountMetrics?.last_month_total_credit ?? 0,
      icon: TrendingUp,
      iconColor: "text-green-600",
      valueColor: "text-green-600",
      formatValue: formatCurrency,
    },
    {
      title: "Last Month Debit",
      value: accountMetrics?.last_month_total_debit ?? 0,
      icon: TrendingDown,
      iconColor: "text-red-600",
      valueColor: "text-red-600",
      formatValue: formatCurrency,
    },
  ];

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
            <div className="shrink-0">
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
            {/* Monitoring Cards */}
            <MonitoringCards
              cards={monitoringCards}
              isLoading={isLoadingMetrics}
              columns={3}
            />
            
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

          {/* Bank Account Card and Account Details Card */}
          <div className="shrink-0 flex flex-col gap-6">
            <BankAccountCard
              account={selectedAccount}
              accounts={accounts}
              onAccountChange={handleAccountChange}
            />
            <AccountDetailsCard
              details={accountDetails}
              isLoading={isLoadingDetails}
              onShowDetails={handleShowDetails}
              accountId={selectedAccountId}
            />
            {/* Payment Type Chart */}
            <PaymentTypeChart
              data={paymentStatistics}
              isLoading={isLoadingPaymentStats}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepositsPage;

