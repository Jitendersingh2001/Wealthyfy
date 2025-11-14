import { useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { CheckboxCard } from "@/components/custom/checkbox-card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FetchType, FrequencyUnit } from "@/types/selectDataStep";
import {
  fetchTypes,
  frequencyUnits,
  FREQUENCY_UNIT_DAY,
  FREQUENCY_UNIT_MONTH,
  FREQUENCY_UNIT_YEAR,
  FREQUENCY_LIMIT_DAY,
  FREQUENCY_LIMIT_MONTH,
  FREQUENCY_LIMIT_YEAR,
} from "@/constants/selectDataStep";
import { cn } from "@/lib/utils";

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
  const isAutoConverting = useRef(false);
  const [open, setOpen] = useState(false);

  // ------------------------------------------------------
  // Helpers
  // ------------------------------------------------------

  const unitLimits: Record<FrequencyUnit, number> = {
    [FREQUENCY_UNIT_DAY]: FREQUENCY_LIMIT_DAY,
    [FREQUENCY_UNIT_MONTH]: FREQUENCY_LIMIT_MONTH,
    [FREQUENCY_UNIT_YEAR]: FREQUENCY_LIMIT_YEAR,
  };

  /** Generates dropdown values from unit-limits */
  const getOptions = () =>
    frequencyUnit ? Array.from({ length: unitLimits[frequencyUnit] }, (_, i) => i + 1) : [];

  /** Handles auto-conversion rules (30 days → 1 month, etc.) */
  const applyAutoConversion = (value: number) => {
    if (frequencyUnit === FREQUENCY_UNIT_DAY && value === FREQUENCY_LIMIT_DAY) {
      return { value: "1", unit: FREQUENCY_UNIT_MONTH as FrequencyUnit };
    }

    if (frequencyUnit === FREQUENCY_UNIT_MONTH && value === FREQUENCY_LIMIT_MONTH) {
      return { value: "1", unit: FREQUENCY_UNIT_YEAR as FrequencyUnit };
    }

    return null;
  };

  // ------------------------------------------------------
  // Event Handlers
  // ------------------------------------------------------

  const handleFetchType = (type: FetchType, checked: boolean) => {
    if (checked) {
      onFetchTypeChange(type);

      if (type === "ONETIME") {
        onFrequencyValueChange("");
        onFrequencyUnitChange(undefined);
      }
      return;
    }

    if (fetchType === type) onFetchTypeChange(undefined);
  };

  const handleFrequencyValue = (value: string) => {
    setOpen(false);

    if (!frequencyUnit || !value) {
      onFrequencyValueChange(value);
      return;
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      onFrequencyValueChange(value);
      return;
    }

    const auto = applyAutoConversion(numeric);
    if (auto) {
      isAutoConverting.current = true;
      onFrequencyValueChange(auto.value);
      onFrequencyUnitChange(auto.unit);

      setTimeout(() => {
        isAutoConverting.current = false;
      }, 0);

      return;
    }

    onFrequencyValueChange(value);
  };

  const handleUnitChange = (unit: FrequencyUnit, checked: boolean) => {
    if (checked) {
      if (!isAutoConverting.current) {
        onFrequencyValueChange("");
        setOpen(false);
      }
      onFrequencyUnitChange(unit);
      return;
    }

    if (frequencyUnit === unit) {
      onFrequencyUnitChange(undefined);
      onFrequencyValueChange("");
      setOpen(false);
    }
  };

  // ------------------------------------------------------
  // Render
  // ------------------------------------------------------

  return (
    <>
      {/* Fetch Type Section */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Fetch Type
          </h2>
          <p className="text-xs text-muted-foreground">Choose how you want to fetch the data</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fetchTypes.map(({ value, label, description }) => (
            <div key={value} className="space-y-1">
              <CheckboxCard
                checked={fetchType === value}
                label={label}
                onCheckedChange={(checked) => handleFetchType(value, checked)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1 ml-1">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequency Section */}
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

          <div className="space-y-5 pb-1">
            {/* Unit */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Frequency Unit</Label>
              <div className="grid grid-cols-3 gap-2">
                {frequencyUnits.map(({ value, label }) => (
                  <CheckboxCard
                    key={value}
                    checked={frequencyUnit === value}
                    label={label}
                    onCheckedChange={(checked) => handleUnitChange(value, checked)}
                  />
                ))}
              </div>
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Frequency Value</Label>

              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!frequencyUnit}
                    className={cn(
                      "w-full justify-between font-normal",
                      !frequencyValue && "text-muted-foreground"
                    )}
                  >
                    <span>{frequencyValue || "Select value"}</span>
                    <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="min-w-(--radix-dropdown-menu-trigger-width) w-full">
                  {getOptions().map((num) => (
                    <DropdownMenuItem key={num} onClick={() => handleFrequencyValue(num.toString())}>
                      {num}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
