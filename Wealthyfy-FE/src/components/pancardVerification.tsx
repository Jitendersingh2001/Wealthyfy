import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface PancardVerificationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PancardVerification({
  open,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onOpenChange: _onOpenChange,
}: PancardVerificationProps) {
  const [pancard, setPancard] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtp, setShowOtp] = useState(false)
  const [errors, setErrors] = useState<{
    pancard?: string
    mobileNumber?: string
  }>({})

  // Validate PAN card format (e.g., ABCDE1234F)
  const validatePancard = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    return panRegex.test(pan.toUpperCase())
  }

  // Validate mobile number (10 digits)
  const validateMobileNumber = (mobile: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/
    return mobileRegex.test(mobile)
  }

  const handleContinue = () => {
    const newErrors: { pancard?: string; mobileNumber?: string } = {}

    if (!pancard.trim()) {
      newErrors.pancard = "PAN card is required"
    } else if (!validatePancard(pancard)) {
      newErrors.pancard = "Please enter a valid PAN card number"
    }

    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required"
    } else if (!validateMobileNumber(mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setShowOtp(true)
    // Here you would typically make an API call to send OTP
  }

  const handleOtpChange = (value: string) => {
    setOtp(value)
  }

  const handleOtpSubmit = () => {
    if (otp.length === 6) {
      // Here you would typically make an API call to verify OTP
      console.log("OTP submitted:", otp)
      // After successful verification, you can close the modal programmatically
      // _onOpenChange(false)
    }
  }

  // Prevent closing the modal - users must complete the verification
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClose = (_open: boolean) => {
    // Do not allow closing - ignore the close attempt
    // Only allow programmatic closing after successful verification
  }

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={true}>
      <DialogContent 
        className="sm:max-w-md" 
        showCloseButton={false} 
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>PAN Card Verification</DialogTitle>
          <DialogDescription>
            {showOtp
              ? "Enter the OTP sent to your registered mobile number"
              : "Enter your PAN card and registered mobile number to continue"}
          </DialogDescription>
        </DialogHeader>

        {!showOtp ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="pancard"
                className="text-sm font-medium leading-none"
              >
                PAN Card Number
              </label>
              <Input
                id="pancard"
                type="text"
                placeholder="ABCDE1234F"
                value={pancard}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/\s/g, "")
                  setPancard(value)
                  if (errors.pancard) {
                    setErrors((prev) => ({ ...prev, pancard: undefined }))
                  }
                }}
                maxLength={10}
                aria-invalid={!!errors.pancard}
                className={errors.pancard ? "border-destructive" : ""}
              />
              {errors.pancard && (
                <p className="text-sm text-destructive">{errors.pancard}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="mobile"
                className="text-sm font-medium leading-none"
              >
                Registered Mobile Number
              </label>
              <Input
                id="mobile"
                type="tel"
                placeholder="9876543210"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  setMobileNumber(value)
                  if (errors.mobileNumber) {
                    setErrors((prev) => ({ ...prev, mobileNumber: undefined }))
                  }
                }}
                maxLength={10}
                aria-invalid={!!errors.mobileNumber}
                className={errors.mobileNumber ? "border-destructive" : ""}
              />
              {errors.mobileNumber && (
                <p className="text-sm text-destructive">{errors.mobileNumber}</p>
              )}
            </div>

            <Button
              onClick={handleContinue}
              className="w-full"
              disabled={!pancard.trim() || !mobileNumber.trim()}
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Enter OTP
              </label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                OTP sent to {mobileNumber}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOtp(false)
                  setOtp("")
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleOtpSubmit}
                className="flex-1"
                disabled={otp.length !== 6}
              >
                Verify OTP
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}