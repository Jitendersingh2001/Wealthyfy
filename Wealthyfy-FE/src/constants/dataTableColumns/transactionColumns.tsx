"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { DATE_FORMATS } from "@/constants/dateFormatConstants";

export type Transactions = {
  id: number;
  accountId: number;
  amount: number;
  mode: string;
  transactionDate: string;
  transactionId: string;
  transactionType: "CREDIT" | "DEBIT";
};

export const columns: ColumnDef<Transactions>[] = [
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <div className="text-sm font-medium">
          {row.getValue("transactionId")}
        </div>
      );
    },
  },
  {
    accessorKey: "transactionType",
    header: "Type",
    enableSorting: true,
    cell: ({ row }) => {
      const type = row.getValue("transactionType") as "CREDIT" | "DEBIT";
      const isCredit = type === "CREDIT";
      return (
        <div className="flex items-center gap-2">
          {isCredit ? (
            <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isCredit
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {type}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    enableSorting: true,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const type = row.original.transactionType;
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);

      return (
        <div
          className={`font-semibold ${
            type === "CREDIT"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {type === "CREDIT" ? "+" : "-"}
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "mode",
    header: "Mode",
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium">
          {row.getValue("mode")}
        </span>
      );
    },
  },
  {
    accessorKey: "transactionDate",
    header: "Date/Time",
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.getValue("transactionDate"));
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {format(date, DATE_FORMATS.DATE_WITH_MONTH)}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(date, DATE_FORMATS.TIME_12_HOUR)}
          </span>
        </div>
      );
    },
  },
];

