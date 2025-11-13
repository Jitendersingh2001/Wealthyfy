import { CheckboxCard } from "@/components/custom/checkbox-card";
import type { FiType } from "@/types/selectDataStep";
import { bankingFiTypes, investmentFiTypes } from "@/constants/selectDataStep";

interface DataTypesStepProps {
  selectedFiTypes: FiType[];
  onSelectionChange: (fiTypes: FiType[]) => void;
}

export function DataTypesStep({
  selectedFiTypes,
  onSelectionChange,
}: DataTypesStepProps) {
  const handleToggle = (fiType: FiType, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedFiTypes, fiType]);
    } else {
      onSelectionChange(selectedFiTypes.filter((type) => type !== fiType));
    }
  };

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Banking
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bankingFiTypes.map((fiType) => (
            <CheckboxCard
              key={fiType.value}
              checked={selectedFiTypes.includes(fiType.value)}
              label={fiType.label}
              onCheckedChange={(checked) => handleToggle(fiType.value, checked)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Investment
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {investmentFiTypes.map((fiType) => (
            <CheckboxCard
              key={fiType.value}
              checked={selectedFiTypes.includes(fiType.value)}
              label={fiType.label}
              onCheckedChange={(checked) => handleToggle(fiType.value, checked)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

