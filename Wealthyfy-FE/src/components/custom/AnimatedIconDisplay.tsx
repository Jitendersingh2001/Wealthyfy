import type { LucideIcon } from "lucide-react";

interface AnimatedIconDisplayProps {
  icon: LucideIcon;
  iconSize?: string;
  iconColor?: string;
  containerSize?: string;
  showCircularBackground?: boolean;
  variant?: "primary" | "destructive" | "success";
}

function AnimatedIconDisplay({
  icon: Icon,
  iconSize = "w-10 h-10",
  iconColor,
  containerSize = "w-40 h-40",
  showCircularBackground = true,
  variant = "primary",
}: AnimatedIconDisplayProps) {
  const colorClasses = {
    primary: {
      bg: "bg-primary",
      border: "border-primary",
      text: "text-primary",
    },
    destructive: {
      bg: "bg-destructive",
      border: "border-destructive",
      text: "text-destructive",
    },
    success: {
      bg: "bg-green-500",
      border: "border-green-500",
      text: "text-green-500",
    },
  };

  const colors = colorClasses[variant];
  const finalIconColor = iconColor || colors.text;

  return (
    <div className="flex justify-center">
      <div className={`relative ${containerSize} flex items-center justify-center`}>
        {/* Animated Background Circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`absolute w-24 h-24 rounded-full ${colors.bg}/15 animate-pulse`}
            style={{ animationDelay: "0s" }}
          />
          <div
            className={`absolute w-20 h-20 rounded-full ${colors.bg}/30 animate-pulse`}
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* Icon with optional Circular Background */}
        <div className="relative z-10">
          {showCircularBackground ? (
            <div className={`w-20 h-20 rounded-full ${colors.bg}/10 border-2 ${colors.border}/30 flex items-center justify-center backdrop-blur-sm`}>
              <Icon className={`${iconSize} ${finalIconColor}`} />
            </div>
          ) : (
            <Icon className={`${iconSize} ${finalIconColor}`} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AnimatedIconDisplay;

