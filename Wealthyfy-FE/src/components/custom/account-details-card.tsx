import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import type { AccountDetails } from "@/services/accountService";
import { format } from "date-fns";

interface AccountDetailsCardProps {
  details: AccountDetails | null;
  isLoading?: boolean;
  onShowDetails?: () => void;
  accountId: number | null;
}

export function AccountDetailsCard({
  details,
  isLoading = false,
  onShowDetails,
  accountId,
}: AccountDetailsCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isWaitingForDetails, setIsWaitingForDetails] = useState(false);

  // Reset revealed state when account changes
  useEffect(() => {
    setIsRevealed(false);
    setIsWaitingForDetails(false);
  }, [accountId]);

  // Automatically reveal when details are loaded (after user clicked eye icon)
  useEffect(() => {
    if (isWaitingForDetails && details) {
      setIsRevealed(true);
      setIsWaitingForDetails(false);
    }
  }, [details, isWaitingForDetails]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  const formatBoolean = (value: boolean | null) => {
    if (value === null) return "N/A";
    return value ? "Yes" : "No";
  };

  const DetailRow = ({ 
    label, 
    value, 
    isBlurred 
  }: { 
    label: string; 
    value: string | null;
    isBlurred: boolean;
  }) => (
    <div className="flex justify-between items-start py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span 
        className={`text-sm text-foreground text-right font-medium ml-4 transition-all ${
          isBlurred ? "blur-sm select-none" : ""
        }`}
      >
        {value || "N/A"}
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="relative w-fit gap-2">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 w-[320px]">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show blurred placeholder rows when details are not loaded
  const detailFields = [
    { label: "Holder Type", value: details?.holder_type || null },
    { label: "CKYC Compliance", value: details && details.ckyc_compliance !== null ? formatBoolean(details.ckyc_compliance) : null },
    { label: "Date of Birth", value: details?.date_of_birth ? formatDate(details.date_of_birth) : null },
    { label: "Email", value: details?.email || null },
    { label: "Phone Number", value: details?.mobile || null },
    { label: "Nominee Status", value: details?.nominee_status || null },
    { label: "PAN", value: details?.pan || null },
    { label: "Branch", value: details?.branch || null },
    { label: "IFSC Code", value: details?.ifsc_code || null },
  ];

  // Show placeholder values when details are not loaded
  const getPlaceholderValue = (label: string) => {
    // Return a placeholder string that looks like blurred data
    const placeholders: Record<string, string> = {
      "Holder Type": "Individual",
      "CKYC Compliance": "Yes",
      "Date of Birth": "01 Jan 1990",
      "Email": "example@email.com",
      "Phone Number": "+91 9876543210",
      "Nominee Status": "Yes",
      "PAN": "ABCDE1234F",
      "Branch": "Main Branch",
      "IFSC Code": "ABCD0123456",
    };
    return placeholders[label] || "N/A";
  };

  return (
    <Card className="relative w-fit gap-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Account Details</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (!isRevealed) {
              // If details not loaded, fetch them first
              if (!details && onShowDetails) {
                setIsWaitingForDetails(true);
                await onShowDetails();
                // Details will be revealed automatically via useEffect when they load
              } else if (details) {
                // If details already exist, just reveal
                setIsRevealed(true);
              }
            } else {
              // Hide details
              setIsRevealed(false);
            }
          }}
          disabled={isLoading}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          title={isRevealed ? "Hide details" : "Show details"}
        >
          {isRevealed ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-0 w-[320px]">
          {detailFields.map((field) => (
            <DetailRow
              key={field.label}
              label={field.label}
              value={
                details
                  ? field.value
                  : isRevealed
                  ? null // Show "N/A" when revealed but no data
                  : getPlaceholderValue(field.label) // Show placeholder when blurred
              }
              isBlurred={!isRevealed || !details}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

