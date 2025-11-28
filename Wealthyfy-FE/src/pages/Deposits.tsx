import { DataTable } from "@/components/custom/data-table";
import { columns, type Transactions } from "@/constants/dataTableColumns/transactionColumns";

function DepositsPage() {
  // Static mock data for now
  const staticData: Transactions[] = [
    {
      id: 1,
      accountId: 1,
      amount: 5000.00,
      mode: "UPI",
      transactionDate: "2024-01-15T10:30:00Z",
      transactionId: "TXN001234",
      transactionType: "CREDIT",
    },
    {
      id: 2,
      accountId: 1,
      amount: 2500.50,
      mode: "NEFT",
      transactionDate: "2024-01-14T14:20:00Z",
      transactionId: "TXN001235",
      transactionType: "DEBIT",
    },
    {
      id: 3,
      accountId: 1,
      amount: 10000.00,
      mode: "IMPS",
      transactionDate: "2024-01-13T09:15:00Z",
      transactionId: "TXN001236",
      transactionType: "CREDIT",
    },
    {
      id: 4,
      accountId: 1,
      amount: 750.25,
      mode: "UPI",
      transactionDate: "2024-01-12T16:45:00Z",
      transactionId: "TXN001237",
      transactionType: "DEBIT",
    },
    {
      id: 5,
      accountId: 1,
      amount: 15000.00,
      mode: "RTGS",
      transactionDate: "2024-01-11T11:00:00Z",
      transactionId: "TXN001238",
      transactionType: "CREDIT",
    },
    {
      id: 6,
      accountId: 1,
      amount: 3200.75,
      mode: "UPI",
      transactionDate: "2024-01-10T08:20:00Z",
      transactionId: "TXN001239",
      transactionType: "DEBIT",
    },
    {
      id: 7,
      accountId: 1,
      amount: 8500.00,
      mode: "NEFT",
      transactionDate: "2024-01-09T13:10:00Z",
      transactionId: "TXN001240",
      transactionType: "CREDIT",
    },
    {
      id: 8,
      accountId: 1,
      amount: 1200.00,
      mode: "IMPS",
      transactionDate: "2024-01-08T15:30:00Z",
      transactionId: "TXN001241",
      transactionType: "DEBIT",
    },
    {
      id: 9,
      accountId: 1,
      amount: 25000.00,
      mode: "RTGS",
      transactionDate: "2024-01-07T10:00:00Z",
      transactionId: "TXN001242",
      transactionType: "CREDIT",
    },
    {
      id: 10,
      accountId: 1,
      amount: 450.50,
      mode: "UPI",
      transactionDate: "2024-01-06T17:45:00Z",
      transactionId: "TXN001243",
      transactionType: "DEBIT",
    },
    {
      id: 11,
      accountId: 1,
      amount: 6800.25,
      mode: "NEFT",
      transactionDate: "2024-01-05T09:25:00Z",
      transactionId: "TXN001244",
      transactionType: "CREDIT",
    },
    {
      id: 12,
      accountId: 1,
      amount: 1500.00,
      mode: "IMPS",
      transactionDate: "2024-01-04T11:15:00Z",
      transactionId: "TXN001245",
      transactionType: "DEBIT",
    },
    {
      id: 13,
      accountId: 1,
      amount: 12000.00,
      mode: "UPI",
      transactionDate: "2024-01-03T14:50:00Z",
      transactionId: "TXN001246",
      transactionType: "CREDIT",
    },
    {
      id: 14,
      accountId: 1,
      amount: 3500.75,
      mode: "RTGS",
      transactionDate: "2024-01-02T16:20:00Z",
      transactionId: "TXN001247",
      transactionType: "DEBIT",
    },
    {
      id: 15,
      accountId: 1,
      amount: 9500.50,
      mode: "NEFT",
      transactionDate: "2024-01-01T08:30:00Z",
      transactionId: "TXN001248",
      transactionType: "CREDIT",
    },
    {
      id: 16,
      accountId: 1,
      amount: 2200.00,
      mode: "UPI",
      transactionDate: "2023-12-31T12:00:00Z",
      transactionId: "TXN001249",
      transactionType: "DEBIT",
    },
    {
      id: 17,
      accountId: 1,
      amount: 18000.00,
      mode: "IMPS",
      transactionDate: "2023-12-30T10:40:00Z",
      transactionId: "TXN001250",
      transactionType: "CREDIT",
    },
    {
      id: 18,
      accountId: 1,
      amount: 650.25,
      mode: "UPI",
      transactionDate: "2023-12-29T15:55:00Z",
      transactionId: "TXN001251",
      transactionType: "DEBIT",
    },
    {
      id: 19,
      accountId: 1,
      amount: 14000.00,
      mode: "RTGS",
      transactionDate: "2023-12-28T09:10:00Z",
      transactionId: "TXN001252",
      transactionType: "CREDIT",
    },
    {
      id: 20,
      accountId: 1,
      amount: 3800.50,
      mode: "NEFT",
      transactionDate: "2023-12-27T13:25:00Z",
      transactionId: "TXN001253",
      transactionType: "DEBIT",
    },
  ];

  return (
    <div className="relative w-full">
      <div className="p-6">
        <DataTable
          columns={columns}
          data={staticData}
          initialSorting={[{ id: "transactionDate", desc: true }]}
        />
      </div>
    </div>
  );
}

export default DepositsPage;

