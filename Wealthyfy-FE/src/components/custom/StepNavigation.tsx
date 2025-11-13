import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/* ------------------------------- Types ------------------------------------ */
interface Step {
  number: number;
  title: string;
}

interface SubStep {
  id: number;
  title: string;
  key: string;
}

interface StepNavigationProps {
  steps: Step[] | SubStep[];
  currentStep: number;
  variant?: "vertical" | "horizontal";
}

/* ---------------------------- Component ----------------------------------- */
function StepNavigation({ steps, currentStep, variant = "vertical" }: StepNavigationProps) {
  /* ---------------------------- Computations ------------------------------ */
  const totalSteps = steps.length - 1;
  const progressHeight = currentStep >= steps.length 
    ? 100 
    : (currentStep / totalSteps) * 100;

  // Check if steps are SubStep format (has 'id' property) or Step format (has 'number' property)
  const isSubStepFormat = steps.length > 0 && 'id' in steps[0];
  
  // Helper to get step number/id
  const getStepNumber = (step: Step | SubStep) => 
    isSubStepFormat ? (step as SubStep).id : (step as Step).number;

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
  
  const isHorizontal = variant === "horizontal";
  
  return (
    <div className={cn(
      isHorizontal 
        ? "flex justify-center mb-8 gap-2" 
        : "w-full h-full bg-card/50 backdrop-blur-sm p-8 rounded-l-xl flex items-start"
    )}>
      <div className={cn(
        isHorizontal ? "flex items-center gap-2" : "w-full relative"
      )}>
        {/* Progress Line - Only for vertical */}
        {!isHorizontal && (
          <div
            className="absolute left-4 top-4 w-0.5 bg-border/30"
            style={{ height: "calc(100% - 2rem)" }}
          >
            <div
              className="absolute left-0 top-0 w-full bg-primary transition-all duration-500 ease-out"
              style={{ height: `${progressHeight}%` }}
            />
          </div>
        )}

        {/* Steps List */}
        <div className={cn(isHorizontal ? "flex items-center gap-2" : "space-y-10")}>
          {steps.map((step, index) => {
            const stepNumber = getStepNumber(step);
            const isActive = index === currentStep && currentStep < steps.length;
            const isCompleted = index < currentStep || currentStep >= steps.length;

            return (
              <div key={stepNumber} className={cn(
                isHorizontal ? "flex items-center gap-2" : "flex items-start gap-4 relative group"
              )}>
                {/* Step Indicator */}
                <div className="relative z-10 shrink-0">
                  <div className={getCircleClasses(isActive, isCompleted)}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className={getStepNumberClasses(isActive)}>
                        {stepNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step Text - Only for vertical */}
                {!isHorizontal && (
                  <div className="flex-1">
                    <div className={getStepLabelClasses(isActive, isCompleted)}>
                      STEP {stepNumber}
                    </div>
                    <div className={getTitleClasses(isActive, isCompleted)}>
                      {step.title}
                    </div>
                  </div>
                )}

                {/* Connector Line - Only for horizontal */}
                {isHorizontal && index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-8 transition-colors",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StepNavigation;
