import { CheckboxCard } from "@/components/custom/checkbox-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FetchType, FrequencyUnit } from "@/types/selectDataStep";
import { fetchTypes, frequencyUnits } from "@/constants/selectDataStep";

interface FetchTypeStepProps {
  fetchType: FetchType | undefined;
  frequencyValue: string;
  frequencyUnit: FrequencyUnit | undefined;
  onFetchTypeChange: (type: FetchType | undefined) => void;
  onFrequencyValueChange: (value: string) => void;
  onFrequencyUnitChange: (unit: FrequencyUnit | undefined) => void;
}

export function FetchTypeStep({
  fetchType,
  frequencyValue,
  frequencyUnit,
  onFetchTypeChange,
  onFrequencyValueChange,
  onFrequencyUnitChange,
}: FetchTypeStepProps) {
  const handleFetchTypeChange = (type: FetchType, checked: boolean) => {
    if (checked) {
      onFetchTypeChange(type);
      if (type === "ONETIME") {
        onFrequencyValueChange("");
        onFrequencyUnitChange(undefined);
      }
    } else if (fetchType === type) {
      onFetchTypeChange(undefined);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Fetch Type
          </h2>
          <p className="text-xs text-muted-foreground">
            Choose how you want to fetch the data
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fetchTypes.map((type) => (
            <div key={type.value}>
              <CheckboxCard
                checked={fetchType === type.value}
                label={type.label}
                onCheckedChange={(checked) => handleFetchTypeChange(type.value, checked)}
              />
              <p className="text-xs text-muted-foreground mt-1 ml-1">
                {type.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {fetchType === "PERIODIC" && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Frequency
            </h2>
            <p className="text-xs text-muted-foreground">
              Set how often to fetch data (e.g., Every 30 days, Every 1 month)
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency-value">Frequency Value</Label>
              <Input
                id="frequency-value"
                type="number"
                min="1"
                placeholder="e.g., 30"
                value={frequencyValue}
                onChange={(e) => onFrequencyValueChange(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency-unit">Frequency Unit</Label>
              <div className="grid grid-cols-3 gap-2">
                {frequencyUnits.map((unit) => (
                  <CheckboxCard
                    key={unit.value}
                    checked={frequencyUnit === unit.value}
                    label={unit.label}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFrequencyUnitChange(unit.value);
                      } else if (frequencyUnit === unit.value) {
                        onFrequencyUnitChange(undefined);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

