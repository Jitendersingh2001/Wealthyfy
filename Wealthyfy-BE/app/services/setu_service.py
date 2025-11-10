from app.config.setting import settings
import requests
from app.constants.setu_api import SetuAPI
from app.constants import constant
from fastapi import status

class SetuService:
    def __init__(self):
        setu_settings = settings.setu

        self._pancard_client_id = setu_settings.SETU_PANCARD_CLIENT_ID
        self._pancard_client_secret = setu_settings.SETU_PANCARD_CLIENT_SECRET
        self._pancard_product_instance_id = setu_settings.SETU_PANCARD_PRODUCT_INSTANCE_ID

    def verify_pancard(self, pancard: str, consent: str) -> bool:
        payload = {
            "pan": pancard,
            "consent": consent,
            "reason": "For User Pan Verification"
        }

        headers = {
            "x-client-id": self._pancard_client_id,
            "x-client-secret": self._pancard_client_secret,
            "x-product-instance-id": self._pancard_product_instance_id,
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(
                SetuAPI.PAN_VERIFICATION_API,
                json=payload,
                headers=headers,
                timeout=10
            )
        except requests.exceptions.RequestException as exc:
            raise RuntimeError(f"Failed connecting to PAN verification service: {exc}") from exc

        if response.status_code != status.HTTP_200_OK:
            raise RuntimeError(
                f"PAN verification API error: {response.status_code} | {response.text}"
            )

        try:
            result = response.json()
        except ValueError:
            raise RuntimeError("Invalid JSON response from PAN verification API")

        verification_status = result.get("verification").lower()

        if verification_status == constant.SUCCESS:
            return True

        if verification_status == constant.FAILED:
            return False

        # Unknown state → treat as failure
        raise RuntimeError(f"Unexpected verification status received: {verification_status}")
