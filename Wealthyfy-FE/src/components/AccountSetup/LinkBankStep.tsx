import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Building2, Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import AnimatedIconDisplay from "@/components/custom/AnimatedIconDisplay";
import FeatureCard, { type FeatureCardData } from "@/components/custom/FeatureCard";
import { type StepWithBackProps } from "@/types/step";
import { ERROR_MESSAGES } from "@/constants/messages";
import { getErrorMessage } from "@/utils/errorHelper";

const featureCards: FeatureCardData[] = [
  {
    icon: Shield,
    title: "Secure & Encrypted",
    description: "Your bank credentials are protected with bank-level security",
  },
  {
    icon: Lock,
    title: "Read-Only Access",
    description: "We only read your account data, no transactions can be made",
  },
];

function LinkBankStep({ onNext, onBack }: StepWithBackProps) {
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkAccount = async () => {
    setIsLinking(true);
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // Example:
      // const response = await userService.linkBankAccount<{ data: unknown; message: string | null }>();
      // toast.success(response?.message || "Bank account linked successfully");
      
      // Placeholder for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Bank account linked successfully");
      onNext();
    } catch (error) {
      toast.error(getErrorMessage(error, ERROR_MESSAGES.FAILED_TO_LINK_BANK_ACCOUNT));
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Animated Visual Element */}
      <AnimatedIconDisplay icon={Building2} containerSize="w-40 h-30" />

      {/* Header */}
      <div className="space-y-3 mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Link Your Bank Account</h1>
        <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          Connect your bank account to complete your account setup and start monitoring your financial data.
        </p>
      </div>

      {/* Features/Benefits */}
      <div className="flex-1 flex flex-col justify-center mb-8">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
          {featureCards.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 mt-auto flex justify-between gap-4">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="flex-1 max-w-[140px]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          type="button"
          size="lg"
          onClick={handleLinkAccount}
          disabled={isLinking}
          className="flex-1"
        >
          {isLinking ? "Linking..." : "Link Your Account"}
          {!isLinking && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}

export default LinkBankStep;
