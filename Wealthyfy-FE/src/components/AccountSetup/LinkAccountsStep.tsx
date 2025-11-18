import { useEffect, useRef } from "react";
import { type StepWithBackProps } from "@/types/step";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedIconDisplay from "@/components/custom/AnimatedIconDisplay";
import { pusherService } from "@/services/pusher";

interface LinkAccountsStepProps extends StepWithBackProps {
  isSetuCallback?: boolean;
  setuError?: { code?: string; message?: string } | null;
}

interface SessionCompletedEvent {
  session_id: string;
  consent_id: string;
  status: string;
}

function LinkAccountsStep({ onNext, onBack, isSetuCallback = false, setuError = null }: LinkAccountsStepProps) {
  const hasTriggeredNext = useRef(false);

  // Listen for session-completed Pusher event
  useEffect(() => {
    const channel = pusherService.getChannel();
    
    if (!channel) {
      console.warn("Pusher channel not available");
      return;
    }

    const handleSessionCompleted = (data: SessionCompletedEvent) => {
      console.log("Received session-completed event:", data);
      
      // Only trigger onNext once and when status is COMPLETED
      if (data.status === "COMPLETED" && !hasTriggeredNext.current) {
        hasTriggeredNext.current = true;
        onNext();
      }
    };

    // Bind to the session-completed event
    channel.bind("session-completed", handleSessionCompleted);

    // Cleanup: unbind the event listener
    return () => {
      channel.unbind("session-completed", handleSessionCompleted);
    };
  }, [onNext]);
  // If user is returning from Setu with an error
  if (isSetuCallback && setuError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-4 py-12" style={{ minHeight: 0, maxWidth: '100%', width: '100%' }}>
        <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-lg">
          <AnimatedIconDisplay
            icon={XCircle}
            iconSize="w-12 h-12"
            containerSize="w-40 h-20"
            showCircularBackground={true}
            variant="destructive"
          />
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Consent Process Failed</h1>
            <div className="space-y-3">
              <p className="text-base text-muted-foreground leading-relaxed">
              Your consent is required to proceed. If you did not cancel or reject the consent, please reach out to Wealthyfy support.
              </p>
              <p className="text-sm text-muted-foreground/80 italic">
              We sincerely apologize for any inconvenience.
              </p>
            </div>
            <div className="pt-4">
              <Button onClick={onBack} size="lg" className="min-w-[200px]">
                Go Back and Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is returning from Setu (post-consent), show waiting state
  if (isSetuCallback) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-4 py-12" style={{ minHeight: 0, maxWidth: '100%', width: '100%' }}>
        <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-lg">
          <AnimatedIconDisplay
            icon={CheckCircle2}
            iconSize="w-12 h-12"
            containerSize="w-40 h-20"
            showCircularBackground={true}
            variant="primary"
          />
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Consent Process Completed</h1>
            <div className="space-y-3">
              <p className="text-base text-muted-foreground leading-relaxed">
                Your bank account linking consent has been successfully processed. We are now waiting for confirmation from the service provider.
              </p>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                You will be notified once the account linking is complete. This page will automatically update when we receive the confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default state: This step should only be shown after Setu callback
  // If somehow reached without callback, show a message
  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ minHeight: 0, maxWidth: '100%', width: '100%' }}>
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Link Your Bank Account</h1>
        <p className="text-sm text-muted-foreground">
          Please complete the consent process to link your accounts.
        </p>
      </div>
    </div>
  );
}

export default LinkAccountsStep;

