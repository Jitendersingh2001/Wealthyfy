import logging
import requests
from fastapi import status
from app.config.setting import settings
from app.constants.setu_api import SetuAPI
from app.constants import constant

logger = logging.getLogger(__name__)


class SetuService:
    """Handles interactions with Setu APIs such as PAN verification and AA token generation."""

    # -----------------------------------------------------------------------
    # Initialization
    # -----------------------------------------------------------------------
    def __init__(self):
        """Load Setu configuration from environment and initialize credentials."""

        setu_settings = settings.setu

        # PAN Verification credentials
        self._pancard_client_id = setu_settings.SETU_PANCARD_CLIENT_ID
        self._pancard_client_secret = setu_settings.SETU_PANCARD_CLIENT_SECRET
        self._pancard_product_instance_id = setu_settings.SETU_PANCARD_PRODUCT_INSTANCE_ID

        # Account Aggregator credentials
        self._aa_client_id = setu_settings.SETU_AA_CLIENT_ID
        self._aa_client_secret = setu_settings.SETU_AA_CLIENT_SECRET
        self._aa_product_instance_id = setu_settings.SETU_AA_PRODUCT_INSTANCE_ID

    # -----------------------------------------------------------------------
    # PAN Verification
    # -----------------------------------------------------------------------
    def verify_pancard(self, pancard: str, consent: str) -> bool:
        """
        Verify PAN using Setu PAN Verification API.

        Returns:
            bool: True if verification is successful, False if failed.

        Raises:
            RuntimeError: For connection errors, invalid responses, unexpected formats.
        """
        payload = {
            "pan": pancard,
            "consent": consent,
            "reason": "For User Pan Verification",
        }

        headers = {
            "x-client-id": self._pancard_client_id,
            "x-client-secret": self._pancard_client_secret,
            "x-product-instance-id": self._pancard_product_instance_id,
            "Content-Type": "application/json",
        }

        logger.info("Sending PAN verification request for PAN=%s", pancard)

        try:
            response = requests.post(
                SetuAPI.PAN_VERIFICATION_API,
                json=payload,
                headers=headers,
                timeout=10,
            )
        except requests.exceptions.RequestException as exc:
            logger.exception("Connection to Setu PAN Verification API failed")
            raise RuntimeError(
                f"Failed connecting to PAN verification service: {exc}"
            ) from exc

        if response.status_code != status.HTTP_200_OK:
            logger.error(
                "Invalid PAN verification response: %s | %s",
                response.status_code,
                response.text,
            )
            raise RuntimeError(
                f"PAN verification API error: {response.status_code} | {response.text}"
            )

        try:
            result = response.json()
            logger.debug("PAN verification API response: %s", result)
        except ValueError:
            logger.error("Non-JSON response received from PAN API")
            raise RuntimeError(
                "Invalid JSON response from PAN verification API")

        verification_status = result.get("verification", "").lower()

        if verification_status == constant.SUCCESS:
            logger.info("PAN verification successful for PAN=%s", pancard)
            return True

        if verification_status == constant.FAILED:
            logger.info("PAN verification failed for PAN=%s", pancard)
            return False

        logger.error("Unexpected verification status: %s", verification_status)
        raise RuntimeError(
            f"Unexpected verification status received: {verification_status}"
        )

    # -----------------------------------------------------------------------
    # Account Aggregator: Token Generation
    # -----------------------------------------------------------------------
    def get_aa_token(self) -> str:
        """
        Retrieve access token from Setu Account Aggregator authentication API.

        Returns:
            str: A valid AA bearer token.

        Raises:
            RuntimeError: For connection issues, missing token, or API failures.
        """
        payload = {
            "clientId": self._aa_client_id,
            "secret": self._aa_client_secret,
            "grant_type": "client_credentials",
        }

        headers = {
            "client": "bridge",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                SetuAPI.AA_AUTH_TOKEN, json=payload, headers=headers, timeout=10
            )

            data = response.json()
            logger.debug("AA token API response: %s", data)

        except requests.exceptions.RequestException as exc:
            logger.exception("Connection to Setu AA Auth API failed")
            raise RuntimeError(
                f"Failed connecting to auth token: {exc}") from exc
        except ValueError:
            logger.error("Non-JSON response received from AA token API")
            raise RuntimeError(
                "Invalid JSON response received from AA Auth API")

        if not data.get("success", False):
            logger.error("Setu AA Auth API returned unsuccessful status")
            raise RuntimeError("Auth API returned unsuccessful status")

        token = data.get("data", {}).get("token")

        if not token:
            logger.error("Token missing from Setu AA Auth response")
            raise RuntimeError("Token not found in the auth response")

        logger.info("Successfully retrieved AA token")
        return token

    # -----------------------------------------------------------------------
    # Create consent URL
    # -----------------------------------------------------------------------

    def create_consent(
        self,
        phone_number: str,
        pancard: str,
        start_date: str,
        end_date: str,
        fi_type: list,
        consent_duration: dict,
        fetch_type: str,
        frequency: dict | None = None
    ):
        token = self.get_aa_token()
        payload = {
            "consentDuration": {
                "unit": consent_duration.get("unit"),
                "value": consent_duration.get("value")
            },
            "PAN": pancard,
            "vua": phone_number,
            "dataRange": {
                "from": start_date,
                "to": end_date
            },
            "purpose": {
                "code": "101",
                "text": "Wealth management service",
                "refUri": "https://api.rebit.org.in/aa/purpose/101.xml",
                "category": {
                    "type": "Wealth management service"
                }
            },
            "fiTypes": fi_type,
            "fetchType": fetch_type,
        }

        # Add frequency only if periodic
        if fetch_type.upper() == "PERIODIC":
            payload["frequency"] = {
                "unit": frequency.get("unit"),
                "value": frequency.get("value")
            }

        headers = {
            "x-product-instance-id": self._aa_product_instance_id,
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }

        try:
            response = requests.post(
                SetuAPI.CREATE_CONSENT_API, json=payload, headers=headers, timeout=10
            )
            print(response)
            data = response.json()
            return data
        except requests.exceptions.RequestException as exc:
            logger.exception("Connection to Setu AA Auth API failed")
            raise RuntimeError(
                f"Failed connecting to auth token: {exc}") from exc
