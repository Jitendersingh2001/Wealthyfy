import type { LucideIcon } from "lucide-react";

interface AnimatedIconDisplayProps {
  icon: LucideIcon;
  iconSize?: string;
  iconColor?: string;
  containerSize?: string;
  showCircularBackground?: boolean;
}

function AnimatedIconDisplay({
  icon: Icon,
  iconSize = "w-10 h-10",
  iconColor = "text-primary",
  containerSize = "w-40 h-40",
  showCircularBackground = true,
}: AnimatedIconDisplayProps) {
  return (
    <div className="flex justify-center">
      <div className={`relative ${containerSize} flex items-center justify-center`}>
        {/* Animated Background Circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute w-24 h-24 rounded-full bg-primary/15 animate-pulse"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute w-20 h-20 rounded-full bg-primary/30 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* Icon with optional Circular Background */}
        <div className="relative z-10">
          {showCircularBackground ? (
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center backdrop-blur-sm">
              <Icon className={`${iconSize} ${iconColor}`} />
            </div>
          ) : (
            <Icon className={`${iconSize} ${iconColor}`} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AnimatedIconDisplay;

