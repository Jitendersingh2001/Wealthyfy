import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { REGEX } from "@/constants/regexConstant";
import { ERROR_MESSAGES } from "@/constants/messages";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateFormData,
  updateConsent,
  updatePanVerify,
} from "@/store/slices/accountSetupSlice";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/utils/errorHelper";

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

/* ------------------------------ Component ---------------------------------- */
function PanMobileStep({ onNext }: PanMobileStepProps) {
  const dispatch = useAppDispatch();
  const saved = useAppSelector((state) => state.accountSetup.formData);
  const { user } = useAuth();

  const phone = user?.phoneNumber || saved.mobile || "";

  const [isConsentDialogOpen, setConsentDialogOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerifiedPan, setLastVerifiedPan] = useState<string>("");

  // Prevent running the hydration logic more than once
  const hasHydrated = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PanMobileFormData>({
    resolver: zodResolver(panMobileSchema),
    mode: "onTouched",
    defaultValues: {
      pan: saved.pan || "",
      mobile: saved.mobile || user?.phoneNumber || "",
    },
  });

  /* ------------------ First-time Data Hydration (Server) ------------------ */
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const fetchPancardData = async () => {
      try {
        const response = await userService.getPancard();

        if (!response?.data) return;

        const { id, pancard, consent } = response.data;

        // 🚨 Only hydrate if user has NOT entered anything previously
        if (!saved.pan && !saved.mobile) {
          reset({ pan: pancard, mobile: phone });

          dispatch(
            updateFormData({
              pan: pancard,
              mobile: phone,
              pancardId: id,
              consent,
              panVerify: true,
            })
          );
        }

        setLastVerifiedPan(saved.pan || pancard);
      } catch (err) {
        console.error("PAN Fetch Error:", err);
      }
    };

    fetchPancardData();
  }, [dispatch, reset, phone, saved.pan, saved.mobile]);

  /* ------------------ Sync Form State → Redux Store ------------------------ */
  useEffect(() => {
    const sub = watch((values) => dispatch(updateFormData(values)));
    return () => sub.unsubscribe();
  }, [watch, dispatch]);

  /* ------------------ Reset Verification if PAN Changes -------------------- */
  const currentPan = watch("pan");

  useEffect(() => {
    if (!currentPan) return;

    if (lastVerifiedPan && currentPan !== lastVerifiedPan) {
      dispatch(updatePanVerify(false));
    } else if (lastVerifiedPan && currentPan === lastVerifiedPan) {
      dispatch(updatePanVerify(true));
    }
  }, [currentPan, lastVerifiedPan, dispatch]);

  /* ----------------------------- API Actions ------------------------------ */
  const verifyPanCard = async () => {
    setIsVerifying(true);
    const panValue = watch("pan");

    try {
      await userService.verifyPancard(panValue);
      setLastVerifiedPan(panValue);
      dispatch(updatePanVerify(true));
      toast.success("PAN card verified successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, ERROR_MESSAGES.FAILED_TO_VERIFY_PAN));
      dispatch(updatePanVerify(false));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyClick = () => {
    if (!saved.consent) {
      setConsentDialogOpen(true);
      return;
    }
    verifyPanCard();
  };

  const handleConsentAccept = async () => {
    dispatch(updateConsent("Y"));
    setConsentDialogOpen(false);
    await verifyPanCard();
  };

  const handleConsentCancel = () => {
    setConsentDialogOpen(false);
    toast.error("Consent is required.");
  };

  const onSubmit = async (data: PanMobileFormData) => {
    try {
      const response = await userService.createPanAndPhoneNo(
        data.mobile,
        data.pan,
        saved.consent,
        saved.pancardId ? String(saved.pancardId) : undefined
      );

      toast.success(response?.message);
      onNext();
    } catch (error) {
      toast.error(getErrorMessage(error, ERROR_MESSAGES.FAILED_TO_SAVE_PAN_AND_PHONE));
    }
  };

  /* -------------------------------- JSX ----------------------------------- */
  return (
    <div className="w-full h-full flex flex-col">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your info</h1>
        <p className="text-base text-muted-foreground">
          Please provide your PAN and mobile number to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col space-y-6">
        {/* PAN Field */}
        <div className="space-y-2">
          <Label htmlFor="pan">PAN Number</Label>
          <div className="flex gap-2">
            <Input
              id="pan"
              maxLength={10}
              placeholder="ABCDE1234F"
              {...register("pan", {
                onChange: (e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                  setValue("pan", value, { shouldValidate: true });
                },
              })}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={handleVerifyClick}
                  disabled={isVerifying || saved.panVerify}
                >
                  {saved.panVerify ? "Verified" : isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Verify your PAN</TooltipContent>
            </Tooltip>
          </div>
          {errors.pan && <p className="text-sm text-destructive">{errors.pan.message}</p>}
        </div>

        {/* Mobile Field */}
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input id="mobile" maxLength={10} placeholder="9876543210" {...register("mobile")} />
          {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
        </div>

        {/* Submit */}
        <div className="pt-4 mt-auto flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting || !isValid || !saved.panVerify}>
            {isSubmitting ? "Saving..." : "Next Step"}
            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </form>

      {/* Consent Dialog */}
      <Dialog open={isConsentDialogOpen} onOpenChange={setConsentDialogOpen}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Consent for PAN Verification</DialogTitle>
            <DialogDescription>
              I authorize the company to use and verify my PAN information in accordance with applicable laws and for identity verification purposes only.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleConsentCancel}>
              Cancel
            </Button>
            <Button onClick={handleConsentAccept}>Accept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PanMobileStep;
