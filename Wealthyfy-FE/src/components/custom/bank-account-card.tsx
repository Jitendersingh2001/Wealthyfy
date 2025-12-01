import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Tilt from "react-parallax-tilt";
import type { DepositAccount } from "@/services/accountService";
import { REGEX } from "@/constants/regexConstant";

interface BankAccountCardProps {
  account: DepositAccount;
  accounts: DepositAccount[];
  onAccountChange: (accountId: number) => void;
}

export function BankAccountCard({
  account,
  accounts,
  onAccountChange,
}: BankAccountCardProps) {
  const accountNumber = account.masked_account_number || "**** **** **** ****";
  const accountHolder = account.holders?.[0]?.name || "Account Holder";

  // Format account number: show masked with last 4 digits (e.g., "**** **** **** 1837")
  const formatAccountNumber = (accNum: string) => {
    // Remove all spaces and non-digits
    const cleaned = accNum.replace(REGEX.WHITESPACE_REGEX, "").replace(REGEX.NON_DIGITS_REGEX, "");
    // Extract last 4 digits
    if (cleaned.length >= 4) {
      const lastFour = cleaned.slice(-4);
      return `**** **** **** ${lastFour}`;
    }
    return "**** **** **** ****";
  };

  const formattedAccountNumber = formatAccountNumber(accountNumber);
  const hasMultipleAccounts = accounts.length > 1;
  
  // Extract last 4 digits for display in dropdown trigger
  const cleaned = accountNumber.replace(REGEX.WHITESPACE_REGEX, "").replace(REGEX.NON_DIGITS_REGEX, "");
  const lastFourDigits = cleaned.length >= 4 ? cleaned.slice(-4) : "****";

  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      perspective={1000}
      transitionSpeed={1500}
      scale={1.02}
      glareEnable={true}
      glareMaxOpacity={0.1}
      glarePosition="all"
      className="relative w-fit"
    >
      <Card className="relative w-fit gap-2 transition-all duration-300 hover:shadow-lg cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Account</CardTitle>
        {hasMultipleAccounts && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <span className="text-xs mr-2">
                  **** **** **** {lastFourDigits}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {accounts.map((acc) => {
                const accNumber = acc.masked_account_number || "**** **** **** ****";
                const cleaned = accNumber.replace(REGEX.WHITESPACE_REGEX, "").replace(REGEX.NON_DIGITS_REGEX, "");
                const lastFour = cleaned.length >= 4 ? cleaned.slice(-4) : "****";
                const accHolder = acc.holders?.[0]?.name || "Account Holder";
                
                return (
                  <DropdownMenuItem
                    key={acc.id}
                    onClick={() => onAccountChange(acc.id)}
                    className={acc.id === account.id ? "bg-accent" : ""}
                  >
                    <div className="flex flex-col w-full">
                      <span className="font-medium text-sm">
                        {accHolder}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        **** **** **** {lastFour}
                      </span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="relative">
        {/* Green Credit Card */}
        <div className="relative overflow-hidden bg-linear-to-br from-green-700 to-green-800 text-white shadow-xl rounded-xl aspect-[85.6/53.98] w-[320px] transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-2xl hover:brightness-110">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 transition-opacity duration-300 hover:opacity-15">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          </div>

          <div className="p-4 h-full flex flex-col justify-between relative z-10">
            {/* Top Section: Chip */}
            <div className="flex justify-between items-start">
              <img 
                src="/chip.png" 
                alt="Chip" 
                className="h-8 w-auto transition-transform duration-300 hover:scale-110"
              />
            </div>

            {/* Middle Section: Account Number */}
            <div className="flex-1 flex items-center">
              <p className="text-lg font-mono font-semibold tracking-wider transition-all duration-300 hover:tracking-widest">
                {formattedAccountNumber}
              </p>
            </div>

            {/* Bottom Section: Name and Logo */}
            <div className="text-left">
              <div>
                <p className="text-sm font-medium transition-all duration-300 hover:font-semibold">{accountHolder}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </Tilt>
  );
}
