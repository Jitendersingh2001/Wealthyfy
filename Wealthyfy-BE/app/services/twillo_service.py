from fastapi import HTTPException, status
from twilio.rest import Client
from app.config.setting import settings
from app.constants.message import Messages
from app.constants.constant import APPROVED

class TwilioService:
    """Twilio OTP service with clean phone normalization and error handling."""

    def __init__(self):
        self.account_sid = settings.twillo.TWILIO_ACCOUNT_SID
        self.auth_token = settings.twillo.TWILIO_AUTH_TOKEN
        self.verify_sid = settings.twillo.TWILIO_VERIFICATION_SERVICE_SID
        self.client = Client(self.account_sid, self.auth_token)

    # -----------------------------------------------------------------------
    # PRIVATE: FORMAT PHONE NUMBER
    # -----------------------------------------------------------------------
    def _format_phone_number(self, phone_number: str, country_code: str = "+91") -> str:
        """Formats phone number to E.164 standard."""
        if not phone_number.startswith("+"):
            return f"{country_code}{phone_number.lstrip('0')}"
        return phone_number

    # -----------------------------------------------------------------------
    # SEND OTP
    # -----------------------------------------------------------------------
    def send_otp(self, phone_number: str) -> str:
        """Sends an OTP to the given phone number via SMS."""
        try:
            phone_number = self._format_phone_number(phone_number)
            verification = self.client.verify.v2.services(self.verify_sid).verifications.create(
                to=phone_number,
                channel="sms",
            )
            return verification.status
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG,
            )

    # -----------------------------------------------------------------------
    # VERIFY OTP
    # -----------------------------------------------------------------------
    def verify_otp(self, phone_number: str, otp: str) -> bool:
        """Verifies an OTP for the given phone number."""
        try:
            phone_number = self._format_phone_number(phone_number)
            verification_check = (
                self.client.verify.v2.services(self.verify_sid)
                .verification_checks.create(to=phone_number, code=otp)
            )
            return verification_check.status == APPROVED
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG,
            )
