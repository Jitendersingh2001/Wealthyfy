export interface StepProps {
  onNext: () => void;
}

export interface StepWithBackProps extends StepProps {
  onBack: () => void;
}

