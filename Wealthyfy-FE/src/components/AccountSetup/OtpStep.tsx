import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { REGEX } from "@/constants/regexConstant";

/* ------------------------------ Props ------------------------------ */
interface OtpStepProps {
  onNext: () => void;
  onBack: () => void;
}

/* ---------------------------- Validation --------------------------- */
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(REGEX.ONLY_DIGITS_REGEX, "OTP must contain only digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

/* ------------------------------- Component ------------------------------- */
function OtpStep({ onNext, onBack }: OtpStepProps) {
  const {
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    mode: "onBlur",
    defaultValues: { otp: "" },
  });

  const otp = watch("otp");

  const onSubmit = async (data: OtpFormData) => {
    console.log("OTP submitted:", data);
    onNext();
  };

  const handleOtpChange = (value: string) => {
    setValue("otp", value, { shouldValidate: false });
  };

  const handleOtpBlur = () => {
    trigger("otp");
  };

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6">
      <CardHeader className="space-y-4 pb-2">
        <CardTitle className="text-3xl font-bold tracking-tight">
          Verify Your Mobile Number
        </CardTitle>
        <CardDescription className="text-base">
          A 6-digit OTP has been sent to the mobile number.
          Please enter it below to continue.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                onBlur={handleOtpBlur} 
                aria-invalid={errors.otp ? "true" : "false"}
              >
                <InputOTPGroup className="gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="h-12 w-12 rounded-md border"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {errors.otp && (
              <p className="text-sm text-destructive mt-1">
                {errors.otp.message}
              </p>
            )}
          </div>

          <div className="text-sm text-muted-foreground pt-2">
            Didn’t receive the OTP?{" "}
            <button
              type="button"
              className="text-primary hover:underline font-medium cursor-pointer"
              onClick={() => console.log("Resend OTP clicked")}
            >
              Resend
            </button>
          </div>

          <CardFooter className="pt-4 px-0 flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onBack}
              className="w-full cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !isValid || otp.length !== 6}
              className="w-full cursor-pointer"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </div>
  );
}

export default OtpStep;
