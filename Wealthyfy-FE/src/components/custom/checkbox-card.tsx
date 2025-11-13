import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  label: string;
  onCheckedChange?: (checked: boolean) => void;
}

const CheckboxCard = React.forwardRef<HTMLButtonElement, CheckboxCardProps>(
  ({ className, checked = false, label, onCheckedChange, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onCheckedChange?.(!checked);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left cursor-pointer",
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
      </button>
    );
  }
);

CheckboxCard.displayName = "CheckboxCard";

export { CheckboxCard };

