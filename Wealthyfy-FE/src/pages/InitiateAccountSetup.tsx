"use client";

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

function InitiateAccountSetupPage() {
  const auth = useAuth();
  const handleUserItemClick = useUserMenuActions();
  useTheme(true);
  useBlockBackNavigation();

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    <WelcomeStep onNext={() => setCurrentStep(1)} />,
    <PanMobileStep onNext={() => setCurrentStep(2)} />,
    <OtpStep onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />,
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        dashboardLayout={auth.isAuthenticated}
        userName={auth.user?.fullName}
        userEmail={auth.user?.email}
        onUserItemClick={handleUserItemClick}
        isInitateSetup={true}
      />

      <div className="flex-1 flex items-center justify-center p-4">
        <Card
          className="
            w-full
            max-w-md
            h-fit
            max-h-[90vh]
            flex
            flex-col  
            items-center
            justify-center
          "
        >
          {steps[currentStep]}
        </Card>
      </div>
    </div>
  );
}

export default InitiateAccountSetupPage;
