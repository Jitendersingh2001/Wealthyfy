import { type StepWithBackProps } from "@/types/step";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedIconDisplay from "@/components/custom/AnimatedIconDisplay";
import { usePusherEvent } from "@/hooks/use-pusher-event";
import { useEffect, useState, useRef } from "react";
import { useSetuCallback } from "@/hooks/use-setu-callback";
import { userService } from "@/services/userService";

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
  // Use useSetuCallback hook to get consent_id (it already uses useSearchParams internally)
  const { consentId } = useSetuCallback();
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);
  const [shouldListenToPusher, setShouldListenToPusher] = useState(false);
  const onNextRef = useRef(onNext);

  // Keep onNext ref up to date
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  // Check session status immediately when component mounts (if returning from Setu)
  useEffect(() => {
    if (isSetuCallback && consentId && !hasCheckedStatus) {
      const checkStatus = async () => {
        try {
          const response = await userService.checkSessionStatus(consentId);
          const sessionInfo = response.data;
          
          console.log("Session status check:", sessionInfo);
          
          // If session is already completed, trigger onNext immediately
          if (sessionInfo.completed && sessionInfo.status === "COMPLETED") {
            console.log("Session already completed, proceeding immediately");
            onNextRef.current();
          } else {
            // Session not completed yet, listen to Pusher event
            console.log("Session not completed yet, listening to Pusher");
            setShouldListenToPusher(true);
          }
        } catch (error) {
          console.error("Failed to check session status:", error);
          // On error, fall back to listening to Pusher
          setShouldListenToPusher(true);
        } finally {
          setHasCheckedStatus(true);
        }
      };
      
      checkStatus();
    } else if (!isSetuCallback) {
      // If not a Setu callback, we can listen to Pusher immediately
      setShouldListenToPusher(true);
      setHasCheckedStatus(true);
    }
  }, [isSetuCallback, consentId, hasCheckedStatus]);

  // Listen for session-completed Pusher event (only if we should listen)
  usePusherEvent<SessionCompletedEvent>(
    "session-completed",
    (data) => {
      console.log("Received session-completed event:", data);
      
      // Only trigger onNext when status is COMPLETED
      if (data.status === "COMPLETED") {
        onNext();
      }
    },
    { once: true, enabled: shouldListenToPusher }
  );
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

