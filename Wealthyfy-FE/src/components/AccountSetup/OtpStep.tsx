import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { REGEX } from "@/constants/regexConstant";

interface OtpStepProps {
  onNext: () => void;
  onBack: () => void;
}

const otpSchema = z.object({
  otp: z
    .string()
    .regex(REGEX.ONLY_DIGITS_REGEX, "OTP must contain only digits")
    .length(6, "OTP must be exactly 6 digits")
    .transform((v) => v.trim()),
});

type OtpFormData = z.infer<typeof otpSchema>;

function OtpStep({ onNext, onBack }: OtpStepProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    mode: "onTouched",
    defaultValues: { otp: "" },
  });

  const otp = watch("otp");

  /* ------------------------- Resend Timer ------------------------- */
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = useCallback(() => {
    console.log("✅ OTP Resent");
    // TODO: Call your resend OTP API here
    setTimer(30); // Reset timer
  }, []);

  /* -------------------------- Submit --------------------------- */
  const onSubmit = useCallback(
    (data: OtpFormData) => {
      console.log(data);
      // TODO: Handle OTP verification here
      onNext();
    },
    [onNext]
  );

  /* ----------------------- Auto Submit -------------------------- */
  useEffect(() => {
    if (otp && otp.length === 6 && isValid && !isSubmitting) {
      handleSubmit(onSubmit)();
    }
  }, [otp, isValid, isSubmitting, handleSubmit, onSubmit]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-4 pb-2 text-center">
        <h1 className="text-3xl font-bold">Verify Your Mobile Number</h1>
        <p className="text-base text-muted-foreground">
          Enter the 6-digit code sent to your mobile number.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* OTP Input */}
        <div className="flex justify-center">
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
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
            )}
          />
        </div>

        {errors.otp && (
          <p className="text-sm text-destructive text-center">{errors.otp.message}</p>
        )}

        {/* Resend Timer */}
        <div className="text-sm text-muted-foreground text-center pt-2">
          {timer > 0 ? (
            <>Resend OTP in <span className="font-semibold">{timer}s</span></>
          ) : (
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={handleResend}
            >
              Resend OTP
            </button>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 flex justify-between">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button type="submit" size="lg" disabled>
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default OtpStep;
