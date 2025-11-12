import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowRight, ArrowLeft, Smartphone } from "lucide-react";
import { REGEX } from "@/constants/regexConstant";
import { useAppSelector } from "@/store/hooks";
import { userService } from "@/services/userService";
import { toast } from "sonner";

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
  const phoneNumber = useAppSelector((state) => state.accountSetup.formData.mobile);
  const hasSentOtpRef = useRef(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    mode: "onTouched",
    defaultValues: { otp: "" },
  });

  const otp = watch("otp");

  /* ------------------------- Resend Timer ------------------------- */
  const [timer, setTimer] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /* ------------------------- Send OTP on Mount ------------------------- */
  useEffect(() => {
    const sendOtpOnMount = async () => {
      if (!phoneNumber || hasSentOtpRef.current) return;

      hasSentOtpRef.current = true;
      setIsSendingOtp(true);

      try {
        const response = await userService.sendOtp<{ data: unknown; message: string | null }>(phoneNumber);
        const message = response?.message || "OTP sent successfully";
        toast.success(message);
        setTimer(30); // Start the timer
      } catch (error) {
        const msg =
          (error as { data?: { message?: string } })?.data?.message ||
          "Failed to send OTP";
        toast.error(msg);
        hasSentOtpRef.current = false; // Allow retry on error
      } finally {
        setIsSendingOtp(false);
      }
    };

    sendOtpOnMount();
  }, [phoneNumber]);

  const handleResend = useCallback(async () => {
    if (!phoneNumber || isSendingOtp) return;

    setIsSendingOtp(true);
    try {
      const response = await userService.sendOtp<{ data: unknown; message: string | null }>(phoneNumber);
      const message = response?.message || "OTP resent successfully";
      toast.success(message);
      setTimer(30);
    } catch (error) {
      const msg =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to resend OTP";
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  }, [phoneNumber, isSendingOtp]);

  /* -------------------------- Submit --------------------------- */
  const onSubmit = useCallback(
    async (data: OtpFormData) => {
      if (!phoneNumber || isVerifyingOtp) return;

      setIsVerifyingOtp(true);
      try {
        const response = await userService.verifyOtp<{ data: unknown; message: string | null }>(phoneNumber, data.otp);
        const message = response?.message || "OTP verified successfully";
        toast.success(message);
        onNext();
      } catch (error) {
        const msg =
          (error as { data?: { message?: string } })?.data?.message ||
          "Invalid or expired OTP";
        toast.error(msg);
        // Clear the OTP input on error
        reset({ otp: "" });
      } finally {
        setIsVerifyingOtp(false);
      }
    },
    [phoneNumber, isVerifyingOtp, onNext, reset]
  );

  /* ----------------------- Auto Submit -------------------------- */
  useEffect(() => {
    if (otp && otp.length === 6 && isValid && !isSubmitting && !isVerifyingOtp) {
      handleSubmit(onSubmit)();
    }
  }, [otp, isValid, isSubmitting, isVerifyingOtp, handleSubmit, onSubmit]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Animated Visual Element */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Animated Background Circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-24 h-24 rounded-full bg-primary/15 animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="absolute w-20 h-20 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Phone Icon */}
          <div className="relative z-10">
            <Smartphone className="w-12 h-12 text-primary/80" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-4 pb-4 text-center">
        <h1 className="text-3xl font-bold">Verify Your Mobile Number</h1>
        <p className="text-base text-muted-foreground">
          {isSendingOtp
            ? "Sending verification code..."
            : "We've sent a 6-digit verification code to the mobile number. Enter the code below."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col space-y-4">
        {/* OTP Input */}
        <div className="flex justify-center pt-2">
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
        <div className="text-sm text-muted-foreground text-center">
          {isSendingOtp ? (
            <span>Sending OTP...</span>
          ) : timer > 0 ? (
            <>Resend OTP in <span className="font-semibold">{timer}s</span></>
          ) : (
            <button
              type="button"
              className="text-primary hover:underline font-medium cursor-pointer"
              onClick={handleResend}
              disabled={isSendingOtp}
            >
              Resend OTP
            </button>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 mt-auto flex justify-between">
          <Button type="button" variant="outline" size="lg" onClick={onBack} >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button 
            type="submit" 
            size="lg" 
            disabled={!isValid || isSubmitting || isVerifyingOtp}
          >
            {isVerifyingOtp ? "Verifying..." : "Next Step"}
            {!isVerifyingOtp && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default OtpStep;
