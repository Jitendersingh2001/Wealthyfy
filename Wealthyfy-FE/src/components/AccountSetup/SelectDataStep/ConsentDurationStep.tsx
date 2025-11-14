import { CheckboxCard } from "@/components/custom/checkbox-card";
import type { ConsentDuration } from "@/types/selectDataStep";
import { consentDurations } from "@/constants/selectDataStep";

interface ConsentDurationStepProps {
  consentDuration: ConsentDuration | undefined;
  onDurationChange: (duration: ConsentDuration | undefined) => void;
}

export function ConsentDurationStep({
  consentDuration,
  onDurationChange,
}: ConsentDurationStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Consent Validity Duration
        </h2>
        <p className="text-xs text-muted-foreground">
          Define how long consent is valid to fetch data
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {consentDurations.map((duration) => (
          <CheckboxCard
            key={duration.value}
            checked={consentDuration === duration.value}
            label={duration.label}
            className="min-h-12"
            onCheckedChange={(checked) => {
              if (checked) {
                onDurationChange(duration.value);
              } else if (consentDuration === duration.value) {
                onDurationChange(undefined);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

