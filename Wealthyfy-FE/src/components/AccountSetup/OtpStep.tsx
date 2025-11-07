import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
    <div className="w-full space-y-6">
      <div className="space-y-4 pb-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Verify Your Mobile Number
        </h1>
        <p className="text-base text-muted-foreground">
          A 6-digit OTP has been sent to the mobile number.
          Please enter it below to continue.
        </p>
      </div>

      <div className="space-y-4 pt-2">
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
            Didn't receive the OTP?{" "}
            <button
              type="button"
              className="text-primary hover:underline font-medium cursor-pointer"
              onClick={() => console.log("Resend OTP clicked")}
            >
              Resend
            </button>
          </div>

          <div className="pt-4 flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onBack}
              className="cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !isValid || otp.length !== 6}
              className="cursor-pointer"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OtpStep;
