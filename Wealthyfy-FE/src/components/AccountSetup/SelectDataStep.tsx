import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { type StepWithBackProps } from "@/types/step";
import StepNavigation from "@/components/custom/StepNavigation";
import { userService } from "@/services/userService";
import { ERROR_MESSAGES } from "@/constants/messages";
import { getErrorMessage } from "@/utils/errorHelper";

import { DataTypesStep } from "@/components/AccountSetup/SelectDataStep/DataTypesStep";
import { PeriodStep } from "@/components/AccountSetup/SelectDataStep/PeriodStep";
import { ConsentDurationStep } from "@/components/AccountSetup/SelectDataStep/ConsentDurationStep";
import { FetchTypeStep } from "@/components/AccountSetup/SelectDataStep/FetchTypeStep";
import { SUB_STEPS } from "@/constants/selectDataStep";
import type {
  FiType,
  ConsentDuration,
  FetchType,
  FrequencyUnit,
} from "@/types/selectDataStep";

function SelectDataStep({ onNext: _onNext, onBack }: StepWithBackProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [currentSubStep, setCurrentSubStep] = useState(1);
  const [selectedFiTypes, setSelectedFiTypes] = useState<FiType[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [consentDuration, setConsentDuration] = useState<
    ConsentDuration | undefined
  >(undefined);
  const [fetchType, setFetchType] = useState<FetchType | undefined>(undefined);
  const [frequencyValue, setFrequencyValue] = useState<string>("");
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit | undefined>(
    undefined
  );

  const validateCurrentStep = (): boolean => {
    switch (currentSubStep) {
      case 1: // Data Types
        if (selectedFiTypes.length === 0) {
          toast.error("Please select at least one financial data type");
          return false;
        }
        return true;
      case 2: // Period
        if (!startDate || !endDate) {
          toast.error("Please select both start date and end date");
          return false;
        }
        if (startDate > endDate) {
          toast.error("Start date must be before or equal to end date");
          return false;
        }
        return true;
      case 3: // Consent Duration
        if (!consentDuration) {
          toast.error("Please select consent validity duration");
          return false;
        }
        return true;
      case 4: // Fetch Type
        if (!fetchType) {
          toast.error("Please select fetch type");
          return false;
        }
        if (fetchType === "PERIODIC") {
          if (!frequencyValue || !frequencyUnit) {
            toast.error(
              "Please enter frequency value and select frequency unit"
            );
            return false;
          }
          const value = parseInt(frequencyValue);
          if (isNaN(value) || value <= 0) {
            toast.error("Frequency value must be a positive number");
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentSubStep < SUB_STEPS.length) {
      setCurrentSubStep(currentSubStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (currentSubStep > 1) {
      setCurrentSubStep(currentSubStep - 1);
    } else {
      onBack();
    }
  };

  // Helper function to parse consent duration
  const parseConsentDuration = (duration: ConsentDuration): { unit: string; value: string } => {
    const parts = duration.split("_");
    const value = parts[0];
    const unit = parts[1] === "DAYS" ? "DAY" : parts[1] === "MONTHS" ? "MONTH" : "YEAR";
    return { unit, value };
  };

  const handleFinalSubmit = async () => {
    if (!startDate || !endDate || !consentDuration || !fetchType) {
      return;
    }

    setIsLinking(true);

    try {
      // Parse consent duration
      const consentDurationObj = parseConsentDuration(consentDuration);

      // Prepare frequency if periodic
      const frequency = fetchType === "PERIODIC" && frequencyUnit && frequencyValue
        ? { unit: frequencyUnit, value: frequencyValue }
        : undefined;

      // Call the link bank API
      const response = await userService.linkBank({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        fi_type: selectedFiTypes,
        consent_duration: consentDurationObj,
        fetch_type: fetchType,
        frequency,
      });

      if (response?.data) {
        // Redirect to consent URL in the same window
        window.location.href = response.data;
      } else {
        toast.error("Failed to get consent URL");
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error, ERROR_MESSAGES.FAILED_TO_LINK_BANK_ACCOUNT)
      );
    } finally {
      setIsLinking(false);
    }
  };

  const renderSubStepContent = () => {
    switch (currentSubStep) {
      case 1:
        return (
          <DataTypesStep
            selectedFiTypes={selectedFiTypes}
            onSelectionChange={setSelectedFiTypes}
          />
        );
      case 2:
        return (
          <PeriodStep
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        );
      case 3:
        return (
          <ConsentDurationStep
            consentDuration={consentDuration}
            onDurationChange={setConsentDuration}
          />
        );
      case 4:
        return (
          <FetchTypeStep
            fetchType={fetchType}
            frequencyValue={frequencyValue}
            frequencyUnit={frequencyUnit}
            onFetchTypeChange={setFetchType}
            onFrequencyValueChange={setFrequencyValue}
            onFrequencyUnitChange={setFrequencyUnit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="space-y-2 mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Select Your Data</h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Step {currentSubStep} of {SUB_STEPS.length}:{" "}
          {SUB_STEPS[currentSubStep - 1].title}
        </p>
      </div>
      {/* Step Indicators */}
      <StepNavigation
        steps={SUB_STEPS}
        currentStep={currentSubStep - 1}
        variant="horizontal"
      />

      {/* Sub-step Content */}
      <div className="flex-1 flex flex-col gap-8 mb-8 overflow-y-auto px-1">
        {renderSubStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className=" mt-auto flex justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleBack}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentSubStep === 1 ? "Back" : "Previous"}
        </Button>

        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          disabled={isLinking}
          className="flex-1"
        >
          {isLinking
            ? "Redirecting to the 3rd party service..."
            : currentSubStep === SUB_STEPS.length
            ? "Link Your Account"
            : "Next"}
          {!isLinking && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}

export default SelectDataStep;
