"use client"

import { Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { PaymentTypeStatistics, PaymentTypeStatistic } from "@/services/accountService"
import { REGEX } from "@/constants/regexConstant"

interface PaymentTypeChartProps {
  data: PaymentTypeStatistics | null;
  isLoading?: boolean;
}

interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  index: number;
}

// Generate chart config dynamically based on payment types
const generateChartConfig = (paymentTypes: PaymentTypeStatistic[]): ChartConfig => {
  const config: ChartConfig = {
    amount: {
      label: "Amount",
    },
  };

  // Map payment types to chart colors
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
  ];

  paymentTypes.forEach((paymentType, index) => {
    const modeKey = paymentType.mode.toLowerCase().replace(REGEX.ONE_OR_MORE_WHITESPACE_REGEX, "_");
    config[modeKey] = {
      label: paymentType.mode,
      color: colors[index % colors.length],
    };
  });

  return config;
};

// Prepare chart data from payment statistics
const prepareChartData = (statistics: PaymentTypeStatistics | null) => {
  if (!statistics || !statistics.payment_types || statistics.payment_types.length === 0) {
    return [];
  }

  return statistics.payment_types.map((paymentType) => {
    const modeKey = paymentType.mode.toLowerCase().replace(REGEX.ONE_OR_MORE_WHITESPACE_REGEX, "_");
    return {
      mode: paymentType.mode,
      amount: paymentType.amount,
      fill: `var(--color-${modeKey})`,
    };
  });
};

export function PaymentTypeChart({ data, isLoading }: PaymentTypeChartProps) {
  if (isLoading) {
    return (
      <Card className="relative w-fit gap-2">
        <CardHeader className="items-center pb-0">
          <div className="h-6 bg-muted animate-pulse rounded-md w-48 mb-2" />
          <div className="h-4 bg-muted animate-pulse rounded-md w-32" />
        </CardHeader>
        <CardContent>
          <div className="mx-auto aspect-square max-h-[250px] bg-muted animate-pulse rounded-full w-[320px]" />
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.payment_types || data.payment_types.length === 0) {
    return (
      <Card className="relative w-fit gap-2">
        <CardHeader className="items-center pb-0">
          <CardTitle>Payment Types Distribution</CardTitle>
          <CardDescription>No payment data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center text-muted-foreground w-[320px]">
            No transactions found
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = prepareChartData(data);
  const chartConfig = generateChartConfig(data.payment_types);

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Custom label function to show percentage with better visibility
  // Recharts passes: { cx, cy, midAngle, innerRadius, outerRadius, percent, index }
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    index,
  }: PieLabelProps) => {
    const paymentType = data.payment_types[index];
    if (!paymentType) return null;

    const percentage = paymentType.percentage.toFixed(1);
    const RADIAN = Math.PI / 180;
    // Position labels outside the pie chart with more space
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="var(--foreground)"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={500}
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <Card className="relative w-fit gap-2 overflow-visible">
      <CardHeader className="items-center pb-0">
        <CardTitle>Payment Types Distribution</CardTitle>
        <CardDescription>
          Total: {formatCurrency(data.total_amount)}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-visible">
        <div className="w-[320px] h-[300px] overflow-visible relative">
          <ChartContainer
            config={chartConfig}
            className="mx-auto w-full h-full overflow-visible [&_.recharts-sector]:cursor-pointer [.dark_&_text]:[text-shadow:0_0_3px_rgba(0,0,0,1),0_0_1px_rgba(0,0,0,1),0_1px_2px_rgba(0,0,0,1)]"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => {
                      const paymentType = data.payment_types.find(
                        (pt) => pt.mode === name
                      );
                      const numValue = typeof value === "number" ? value : Number(value);
                      if (paymentType) {
                        return [
                          formatCurrency(numValue),
                          `${paymentType.mode} (${paymentType.percentage.toFixed(1)}%)`,
                        ];
                      }
                      return [formatCurrency(numValue), name];
                    }}
                    className="gap-2 px-3 py-2"
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="amount"
                label={renderCustomLabel}
                labelLine={{ stroke: "var(--foreground)", strokeWidth: 1 }}
                nameKey="mode"
                cx="50%"
                cy="50%"
                outerRadius={75}
                innerRadius={0}
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

