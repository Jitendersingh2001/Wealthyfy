import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  fullscreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  size = 50,
  className,
  fullscreen = false,
  ...props
}) => {
  const LoaderSVG = (
    <svg
      height={size}
      width={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      aria-label="Loading..."
      role="status"
      {...props}
    >
      <title>Loading...</title>
      <style>{`
        .spinner-bar {
          animation: spinner-bars-animation 0.8s linear infinite;
          animation-delay: -0.8s;
        }
        .spinner-bar-2 {
          animation-delay: -0.65s;
        }
        .spinner-bar-3 {
          animation-delay: -0.5s;
        }
        @keyframes spinner-bars-animation {
          0% {
            y: 1px;
            height: 22px;
            opacity: 1;
          }
          93.75% {
            y: 5px;
            height: 14px;
            opacity: 0.2;
          }
        }
      `}</style>

      <rect className="spinner-bar" fill="currentColor" height="22" width="6" x="1" y="1" />
      <rect className="spinner-bar spinner-bar-2" fill="currentColor" height="22" width="6" x="9" y="1" />
      <rect className="spinner-bar spinner-bar-3" fill="currentColor" height="22" width="6" x="17" y="1" />
    </svg>
  );

  // ✅ Wrap with fullscreen view if needed
  if (fullscreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        {LoaderSVG}
      </div>
    );
  }

  return LoaderSVG;
};

export default Loader;
