import type { LucideIcon } from "lucide-react";

export interface FeatureCardData {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconSize?: string;
  iconColor?: string;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  iconSize = "w-5 h-5",
  iconColor = "text-primary",
}: FeatureCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
      <div className="mt-0.5">
        <Icon className={`${iconSize} ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

export default FeatureCard;

