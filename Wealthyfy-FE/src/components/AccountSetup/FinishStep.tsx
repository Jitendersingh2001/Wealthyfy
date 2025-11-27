import { CheckCircle2, ArrowRight } from "lucide-react";
import AnimatedIconDisplay from "@/components/custom/AnimatedIconDisplay";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import {useAuth} from "@/hooks/use-auth";

function FinishStep() {
  const { updateSetupComplete } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const hasMarkedComplete = useRef(false);

  const handleContinue = () => {
    if (hasMarkedComplete.current || isLoading) {
      return;
    }

    setIsLoading(true);
    hasMarkedComplete.current = true;

    userService
      .markSetupComplete()
      .then(() => {
        updateSetupComplete(true);
        navigate(ROUTES.DASHBOARD);
      })
      .catch((error) => {
        console.error("Failed to mark setup as complete:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4" style={{ minHeight: 0, maxWidth: '100%', width: '100%' }}>
      <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-lg">
        <AnimatedIconDisplay
          icon={CheckCircle2}
          iconSize="w-12 h-12"
          containerSize="w-40 h-20"
          showCircularBackground={true}
          variant="primary"
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Everything is Set Up!</h1>
          <div className="space-y-4 mt-4">
            <p className="text-base text-muted-foreground leading-relaxed">
              Your account setup has been completed successfully. We've securely connected your financial accounts and are now ready to help you manage your wealth.
            </p>
          </div>
        </div>
        <Button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          size="lg"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? "Processing..." : "Continue"}
            {!isLoading && (
              <ArrowRight 
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
              />
            )}
          </span>
          <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </Button>
      </div>
    </div>
  );
}

export default FinishStep;

