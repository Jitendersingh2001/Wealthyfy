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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

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
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your info</h1>
        <p className="text-base text-muted-foreground">
          Please provide your PAN and mobile number to continue.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col space-y-6"
      >
        {/* PAN */}
        <div className="space-y-2">
          <Label htmlFor="pan" className="text-sm font-medium">
            PAN Number
          </Label>
          <div className="flex gap-2">
            <Input
              id="pan"
              placeholder="ABCDE1234F"
              maxLength={10}
              className="h-11 flex-1"
              {...register("pan")}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" className="h-11 min-w-[100px]">
                  Verify
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click here to verify the Pan card</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {errors.pan && (
            <p className="text-sm text-destructive mt-1">
              {errors.pan.message}
            </p>
          )}
        </div>

        {/* Mobile */}
        <div className="space-y-2">
          <Label htmlFor="mobile" className="text-sm font-medium">
            Mobile Number
          </Label>
          <Input
            id="mobile"
            placeholder="9876543210"
            maxLength={10}
            className="h-11"
            {...register("mobile")}
          />
          {errors.mobile && (
            <p className="text-sm text-destructive mt-1">
              {errors.mobile.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 mt-auto flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !isValid}
            className="group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] min-w-[140px] cursor-pointer"
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
