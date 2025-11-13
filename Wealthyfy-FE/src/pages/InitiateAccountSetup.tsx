"use client";

/* ------------------------------- Imports ---------------------------------- */
import { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useUserMenuActions } from "@/hooks/use-user-menu-actions";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { useBlockBackNavigation } from "@/hooks/use-block-back-navigation";
import WelcomeStep from "@/components/AccountSetup/WelcomeStep";
import PanMobileStep from "@/components/AccountSetup/PanMobileStep";
import OtpStep from "@/components/AccountSetup/OtpStep";
import StepNavigation from "@/components/custom/StepNavigation";
import SelectDataStep from "@/components/AccountSetup/SelectDataStep";

/* ------------------------------ Component --------------------------------- */
function InitiateAccountSetupPage() {
  /* ----------------------------- Hooks Setup ------------------------------- */
  const auth = useAuth();
  const handleUserItemClick = useUserMenuActions();
  useTheme(true);
  useBlockBackNavigation();

  /* ----------------------------- State ------------------------------------- */
  const [currentStep, setCurrentStep] = useState(0);

  /* ------------------------------- Steps ----------------------------------- */
  const steps = [
    <WelcomeStep onNext={() => setCurrentStep(3)} />,
    <PanMobileStep onNext={() => setCurrentStep(2)} />,
    <OtpStep
      onNext={() => setCurrentStep(3)}
      onBack={() => setCurrentStep(1)}
    />,
    <SelectDataStep 
      onNext={() => setCurrentStep(4)}
      onBack={() => setCurrentStep(2)}
    />,
  ];

  /* ------------------------- Side Panel Step Info -------------------------- */
  const stepConfig = [
    { number: 1, title: "Your Info" },
    { number: 2, title: "Verify" },
    { number: 3, title: "Select Data" },
    { number: 4, title: "Fetch Data" },
    { number: 5, title: "Finish" },
  ];

  const isWelcomeStep = currentStep === 0;

  /* ------------------------------ Render ----------------------------------- */
  return (
    <div className="min-h-screen flex flex-col">
      {/* --------------------------- Navigation Bar -------------------------- */}
      <Navbar
        dashboardLayout={auth.isAuthenticated}
        userName={auth.user?.fullName}
        userEmail={auth.user?.email}
        onUserItemClick={handleUserItemClick}
        isInitateSetup={true}
      />

      {/* ----------------------------- Layout -------------------------------- */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card
          className={
            isWelcomeStep
              ? "w-full max-w-md h-fit flex flex-col"
              : "w-full max-w-4xl h-fit max-h-[90vh] flex flex-row overflow-hidden"
          }
        >
          {isWelcomeStep ? (
            /* --------------------------- Welcome Step ----------------------- */
            <div className="p-2">{steps[0]}</div>
          ) : (
            /* ------------------------- Multi-Step Layout -------------------- */
            <>
              {/* Step Navigation Sidebar */}
              <div className="w-64 min-w-[256px] shrink-0 h-full">
                <StepNavigation
                  steps={stepConfig}
                  currentStep={currentStep - 1}
                />
              </div>

              {/* Active Step Content */}
              <div className="border-l border-border flex-1 bg-card rounded-r-xl overflow-y-auto">
                <div className="w-full h-full flex justify-center p-8">
                  <div className="w-full max-w-lg h-full flex flex-col">
                    {steps[currentStep] || (
                      <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold">Setup Complete!</h1>
                        <p className="text-base text-muted-foreground">
                          Your account setup has been completed successfully. You
                          will be redirected to the dashboard shortly.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default InitiateAccountSetupPage;
