"use client"

import { useState, useEffect } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { accountService, type MonthlyCreditDebitStatistics } from "@/services/accountService";

interface CreditDebitChartProps {
  accountId: number;
}

const chartConfig: ChartConfig = {
  credit: {
    label: "Credit",
    color: "hsl(142, 76%, 36%)", // Green color for credit
  },
  debit: {
    label: "Debit",
    color: "hsl(0, 84%, 60%)", // Red color for debit
  },
};

export function CreditDebitChart({ accountId }: CreditDebitChartProps) {
  const [statistics, setStatistics] = useState<MonthlyCreditDebitStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Fetch available years on mount
  useEffect(() => {
    const fetchAvailableYears = async () => {
      if (!accountId) return;
      
      try {
        setIsLoading(true);
        const data = await accountService.getMonthlyStatistics(accountId);
        setStatistics(data);
        
        // Set default year to the most recent year if not already set
        if (data.available_years.length > 0) {
          setSelectedYear((prevYear) => prevYear ?? data.available_years[0]);
        }
      } catch (error) {
        console.error("Failed to fetch monthly statistics:", error);
        setStatistics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableYears();
  }, [accountId]);

  // Fetch monthly data when year changes
  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (!accountId || selectedYear === null) return;
      
      try {
        setIsLoading(true);
        const data = await accountService.getMonthlyStatistics(accountId, selectedYear);
        setStatistics(data);
      } catch (error) {
        console.error("Failed to fetch monthly statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedYear !== null) {
      fetchMonthlyData();
    }
  }, [accountId, selectedYear]);

  const availableYears = statistics?.available_years || [];
  const monthlyData = statistics?.monthly_data || [];

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="relative w-full gap-2">
        <CardHeader className="items-center pb-0">
          <div className="h-6 bg-muted animate-pulse rounded-md w-48 mb-2" />
          <div className="h-4 bg-muted animate-pulse rounded-md w-32" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && (!statistics || availableYears.length === 0)) {
    return (
      <Card className="relative w-full gap-2">
        <CardHeader className="items-center pb-0">
          <CardTitle>Credit & Debit - Monthly</CardTitle>
          <CardDescription>No transaction data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No transactions found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative w-full gap-2">
      <CardHeader className="items-center pb-0">
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>Credit & Debit - Monthly</CardTitle>
            <CardDescription>
              {selectedYear ? `${selectedYear} Overview` : "Select a year"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-sm"
              >
                <span>{selectedYear || "Select Year"}</span>
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {availableYears.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={selectedYear === year ? "bg-accent" : ""}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full [&_.recharts-bar-rectangle]:cursor-pointer">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                hide
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const numValue = typeof value === "number" ? value : Number(value);
                      return [formatCurrency(numValue), name];
                    }}
                    labelFormatter={(label) => `Month: ${label}`}
                    className="gap-2 px-3 py-2"
                  />
                }
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="square"
              />
              <Bar
                dataKey="credit"
                fill="var(--color-credit)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="debit"
                fill="var(--color-debit)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

