import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { REGEX } from "@/constants/regexConstant";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateFormData } from "@/store/slices/accountSetupSlice";

/* ---------------------------------- Types ---------------------------------- */
interface PanMobileStepProps {
  onNext: () => void;
}

/* ------------------------------ Form Schema -------------------------------- */
const panMobileSchema = z.object({
  pan: z
    .string()
    .min(1, "PAN number is required")
    .length(10, "PAN number must be exactly 10 characters")
    .regex(REGEX.PAN_REGEX, "Invalid PAN format (e.g., ABCDE1234F)")
    .transform((v) =>
      v.toUpperCase().replace(REGEX.NON_ALPHANUMERIC_PAN_CHARS_REGEX, "")
    ),

  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .length(10, "Mobile number must be exactly 10 digits")
    .regex(REGEX.MOBILE_REGEX, "Mobile number must contain only digits")
    .transform((v) => v.replace(REGEX.NON_DIGITS_REGEX, "")),
});

type PanMobileFormData = z.infer<typeof panMobileSchema>;

function PanMobileStep({ onNext }: PanMobileStepProps) {
  const dispatch = useAppDispatch();
  const saved = useAppSelector((state) => state.accountSetup.formData);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PanMobileFormData>({
    resolver: zodResolver(panMobileSchema),
    mode: "onTouched",
    defaultValues: {
      pan: saved.pan || "",
      mobile: saved.mobile || "",
    },
  });

  /* ----------------------- Sync Redux on Every Change ---------------------- */
  useEffect(() => {
    const subscription = watch((values) => {
      dispatch(updateFormData(values));
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  /* ----------------------------- Handlers ---------------------------------- */
  const onSubmit = (data: PanMobileFormData) => {
    dispatch(updateFormData(data));
    onNext();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Your info</h1>
        <p className="text-base text-muted-foreground">
          Please provide your PAN and mobile number to continue.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        {/* PAN */}
        <div className="space-y-2">
          <Label htmlFor="pan">PAN Number</Label>
          <Input
            id="pan"
            placeholder="ABCDE1234F"
            maxLength={10}
            {...register("pan")}
          />
          {errors.pan && (
            <p className="text-sm text-destructive">{errors.pan.message}</p>
          )}
        </div>

        {/* Mobile */}
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            placeholder="9876543210"
            maxLength={10}
            {...register("mobile")}
          />
          {errors.mobile && (
            <p className="text-sm text-destructive">{errors.mobile.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !isValid}
            className="group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Next Step
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default PanMobileStep;
