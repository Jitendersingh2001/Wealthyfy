import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/* ------------------------------- Types ------------------------------------ */
interface Step {
  number: number;
  title: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
}

/* ---------------------------- Component ----------------------------------- */
function StepNavigation({ steps, currentStep }: StepNavigationProps) {
  /* ---------------------------- Computations ------------------------------ */
  const totalSteps = steps.length - 1;
  const progressHeight = currentStep >= steps.length 
    ? 100 
    : (currentStep / totalSteps) * 100;

  /* ------------------------ UI Style Helpers ------------------------------ */
  const getCircleClasses = (isActive: boolean, isCompleted: boolean) =>
    cn(
      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
      isActive && "border-primary bg-card scale-110 shadow-lg shadow-primary/20",
      isCompleted && "border-primary bg-primary text-primary-foreground",
      !isActive && !isCompleted && "border-muted-foreground/30 bg-card"
    );

  const getStepNumberClasses = (isActive: boolean) =>
    cn(
      "text-xs font-semibold",
      isActive ? "text-primary" : "text-muted-foreground/50"
    );

  const getStepLabelClasses = (isActive: boolean, isCompleted: boolean) =>
    cn(
      "text-xs font-semibold uppercase tracking-wider transition-colors mb-1",
      isActive && "text-primary",
      isCompleted && "text-muted-foreground",
      !isActive && !isCompleted && "text-muted-foreground/50"
    );

  const getTitleClasses = (isActive: boolean, isCompleted: boolean) =>
    cn(
      "text-base font-medium transition-colors",
      isActive && "text-foreground font-bold",
      isCompleted && "text-muted-foreground",
      !isActive && !isCompleted && "text-muted-foreground/60"
    );

  /* ------------------------------ Render ---------------------------------- */
  return (
    <div className="w-full h-full bg-card/50 backdrop-blur-sm p-8 rounded-l-xl flex items-start">
      <div className="w-full relative">

        {/* Progress Line */}
        <div
          className="absolute left-4 top-4 w-0.5 bg-border/30"
          style={{ height: "calc(100% - 2rem)" }}
        >
          <div
            className="absolute left-0 top-0 w-full bg-primary transition-all duration-500 ease-out"
            style={{ height: `${progressHeight}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-10">
          {steps.map((step, index) => {
            const isActive = index === currentStep && currentStep < steps.length;
            const isCompleted = index < currentStep || currentStep >= steps.length;

            return (
              <div key={step.number} className="flex items-start gap-4 relative group">

                {/* Step Indicator */}
                <div className="relative z-10 shrink-0">
                  <div className={getCircleClasses(isActive, isCompleted)}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className={getStepNumberClasses(isActive)}>
                        {step.number}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step Text */}
                <div className="flex-1">
                  <div className={getStepLabelClasses(isActive, isCompleted)}>
                    STEP {step.number}
                  </div>
                  <div className={getTitleClasses(isActive, isCompleted)}>
                    {step.title}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default StepNavigation;
