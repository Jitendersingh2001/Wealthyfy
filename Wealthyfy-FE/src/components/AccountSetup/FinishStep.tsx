import { type StepWithBackProps } from "@/types/step";
import { CheckCircle2 } from "lucide-react";
import AnimatedIconDisplay from "@/components/custom/AnimatedIconDisplay";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/routes";

interface FinishStepProps extends StepWithBackProps {}

function FinishStep({ onNext: _onNext, onBack: _onBack }: FinishStepProps) {
  const [countdown, setCountdown] = useState(15);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown === 0) {
      navigate(ROUTES.DASHBOARD);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

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
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Everything is Set Up!</h1>
          <div className="space-y-3">
            <p className="text-base text-muted-foreground leading-relaxed">
              Your account setup has been completed successfully.
            </p>
            <p className="text-lg font-semibold text-foreground">
              You will be redirected to the dashboard in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinishStep;

