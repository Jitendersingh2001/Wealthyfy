import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MonitoringCardItem {
  title: string;
  value: string | number | null;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  formatValue?: (value: string | number | null) => string;
  iconBgColor?: string;
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
      <div className={cn("grid gap-6 mb-6", gridCols[columns], className)}>
        {cards.map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="h-5 bg-muted animate-pulse rounded-md w-32 mb-4" />
              <div className="h-10 bg-muted animate-pulse rounded-md w-40" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6 mb-6", gridCols[columns], className)}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        const formattedValue = card.formatValue
          ? card.formatValue(card.value)
          : defaultFormatValue(card.value);

        // Determine icon background color based on icon color or default
        const getIconBgColor = () => {
          if (card.iconBgColor) return card.iconBgColor;
          if (card.iconColor?.includes("green")) {
            return "bg-green-500/10 dark:bg-green-500/20";
          }
          if (card.iconColor?.includes("red")) {
            return "bg-red-500/10 dark:bg-red-500/20";
          }
          return "bg-primary/10 dark:bg-primary/20";
        };

        const iconBg = getIconBgColor();

        return (
          <Card
            key={index}
            className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-border/50 cursor-pointer"
          >
            
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] group-hover:opacity-[0.04] dark:group-hover:opacity-[0.05] transition-opacity duration-300">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }} />
            </div>

            <CardHeader className="flex flex-row items-start justify-between pb-3 relative z-10">
              <div className="flex-1">
                <CardTitle className="text-sm font-medium text-muted-foreground mb-4 tracking-wide">
                  {card.title}
                </CardTitle>
                <div
                  className={cn(
                    "text-3xl font-bold tracking-tight transition-colors duration-300",
                    card.valueColor || "text-foreground"
                  )}
                >
                  {formattedValue}
                </div>
              </div>
              {Icon && (
                <div className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-110",
                  iconBg,
                  card.iconColor || "text-primary"
                )}>
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-colors duration-300",
                      card.iconColor || "text-primary"
                    )}
                  />
                  {/* Icon glow effect on hover */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300",
                    card.iconColor?.includes("green") ? "bg-green-500/30" :
                    card.iconColor?.includes("red") ? "bg-red-500/30" :
                    "bg-primary/30"
                  )} />
                </div>
              )}
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}

