import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/custom/date-picker";

interface PeriodStepProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

export function PeriodStep({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: PeriodStepProps) {
  // Compute "today" once
  const today = (() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return now;
  })();

  // Start date must be <= endDate (if selected), otherwise <= today
  const startDateMax = endDate && endDate < today ? endDate : today;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Period
        </h2>
        <p className="text-xs text-muted-foreground">
          Choose the date range for the financial data you want to share
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start-date" className="text-sm font-medium">
            Start Date
          </Label>
          <div className="w-full">
            <DatePicker
              date={startDate}
              onSelect={onStartDateChange}
              placeholder="Select start date"
              maxDate={startDateMax}
              className="w-full"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-sm font-medium">
            End Date
          </Label>
          <div className="w-full">
            <DatePicker
              date={endDate}
              onSelect={onEndDateChange}
              placeholder="Select end date"
              minDate={startDate}
              maxDate={today}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
