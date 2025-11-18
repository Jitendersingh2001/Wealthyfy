import { type StepWithBackProps } from "@/types/step";
import { Database, Loader2 } from "lucide-react";
import AnimatedIconDisplay from "@/components/custom/AnimatedIconDisplay";

interface FetchDataStepProps extends StepWithBackProps {}

function FetchDataStep({ onNext: _onNext, onBack: _onBack }: FetchDataStepProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 py-12" style={{ minHeight: 0, maxWidth: '100%', width: '100%' }}>
      <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-lg">
        <AnimatedIconDisplay
          icon={Database}
          iconSize="w-12 h-12"
          containerSize="w-40 h-20"
          showCircularBackground={true}
          variant="primary"
        />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Fetching Your Data</h1>
          <div className="space-y-3">
            <p className="text-base text-muted-foreground leading-relaxed">
              We are currently fetching your financial data from the connected accounts. This process may take some time.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-medium">Estimated time: ~5 minutes</span>
            </div>
            <p className="text-sm text-muted-foreground/80 leading-relaxed italic">
              Please wait while we retrieve your information. You will be notified once the process is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FetchDataStep;

