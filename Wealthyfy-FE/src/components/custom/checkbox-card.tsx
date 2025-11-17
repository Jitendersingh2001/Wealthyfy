import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxCardProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  label: string;
  onCheckedChange?: (checked: boolean) => void;
}

const CheckboxCard = React.forwardRef<HTMLDivElement, CheckboxCardProps>(
  ({ className, checked = false, label, onCheckedChange, onClick, onKeyDown, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      onCheckedChange?.(!checked);
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onCheckedChange?.(!checked);
      }
      onKeyDown?.(e);
    };

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-checked={checked}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          checked
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          className
        )}
        {...props}
      >
        <span className="text-sm font-medium flex-1">{label}</span>
        <div 
          onClick={(e) => e.stopPropagation()} 
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center justify-center shrink-0"
        >
          <Checkbox checked={checked} className="size-5" />
        </div>
      </div>
    );
  }
);

CheckboxCard.displayName = "CheckboxCard";

export { CheckboxCard };

