import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { REGEX } from "@/constants/regexConstant";

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
    .regex(REGEX.PAN_REGEX, "Invalid PAN format (e.g., ABCDE1234F)"),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .length(10, "Mobile number must be exactly 10 digits")
    .regex(REGEX.MOBILE_REGEX, "Mobile number must contain only digits"),
});

type PanMobileFormData = z.infer<typeof panMobileSchema>;

/* --------------------------- Input Normalization --------------------------- */
const normalizePan = (value: string) =>
value.toUpperCase().replace(REGEX.NON_ALPHANUMERIC_PAN_CHARS_REGEX, "");

const normalizeMobile = (value: string) => value.replace(REGEX.NON_DIGITS_REGEX, "");

function PanMobileStep({ onNext }: PanMobileStepProps) {
  /* ------------------------------ Form Setup ------------------------------ */
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, touchedFields, isSubmitting, isValid },
  } = useForm<PanMobileFormData>({
    resolver: zodResolver(panMobileSchema),
    mode: "onTouched",
  });

  /* ------------------------------- Handlers -------------------------------- */
  const onSubmit = async (data: PanMobileFormData) => {
    console.log("Form submitted:", data);
    onNext();
  };

  /* --------------------------------- UI ----------------------------------- */
  return (
    <div className="w-full space-y-6">
      {/* ---------------------------- Form Header ---------------------------- */}
      <div className="space-y-4 pb-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Your info
        </h1>
        <p className="text-base text-muted-foreground">
          Please provide your PAN and mobile number to continue.
        </p>
      </div>

      {/* ------------------------------- Form -------------------------------- */}
      <div className="space-y-4 pt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          {/* --------------------------- PAN Field ---------------------------- */}
          <div className="space-y-2">
            <Label htmlFor="pan">PAN Number</Label>
            <Input
              id="pan"
              type="text"
              placeholder="ABCDE1234F"
              autoComplete="off"
              maxLength={10}
              className="uppercase"
              {...register("pan", {
                onChange: (e) =>
                  setValue("pan", normalizePan(e.target.value), {
                    shouldValidate: true,
                  }),
              })}
            />
            {touchedFields.pan && errors.pan && (
              <p className="text-sm text-destructive mt-1">
                {errors.pan.message}
              </p>
            )}
          </div>

          {/* -------------------------- Mobile Field -------------------------- */}
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="9876543210"
              autoComplete="off"
              maxLength={10}
              {...register("mobile", {
                onChange: (e) =>
                  setValue("mobile", normalizeMobile(e.target.value), {
                    shouldValidate: true,
                  }),
              })}
            />
            {touchedFields.mobile && errors.mobile && (
              <p className="text-sm text-destructive mt-1">
                {errors.mobile.message}
              </p>
            )}
          </div>

          {/* -------------------------- Submit Button ------------------------- */}
          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !isValid}
              className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Next Step
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PanMobileStep;
