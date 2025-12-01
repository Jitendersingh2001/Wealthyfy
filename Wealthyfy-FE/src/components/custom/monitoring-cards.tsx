import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MonitoringCardItem {
  title: string;
  value: string | number | null;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  formatValue?: (value: string | number | null) => string;
}

interface MonitoringCardsProps {
  cards: MonitoringCardItem[];
  isLoading?: boolean;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function MonitoringCards({
  cards,
  isLoading = false,
  columns = 3,
  className,
}: MonitoringCardsProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const defaultFormatValue = (value: string | number | null) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "number") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }
    return String(value);
  };

  if (isLoading) {
    return (
      <div className={cn("grid gap-4 mb-6", gridCols[columns], className)}>
        {cards.map((_, i) => (
          <Card key={i} className="relative">
            <CardHeader>
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 mb-6", gridCols[columns], className)}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        const formattedValue = card.formatValue
          ? card.formatValue(card.value)
          : defaultFormatValue(card.value);

        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4",
                    card.iconColor || "text-muted-foreground"
                  )}
                />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-2xl font-bold",
                  card.valueColor || "text-foreground"
                )}
              >
                {formattedValue}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

