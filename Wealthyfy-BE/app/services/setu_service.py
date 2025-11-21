import requests
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from fastapi import status

from requests.exceptions import RequestException, JSONDecodeError

from app.config.setting import settings
from app.constants.setu_api import SetuAPI
from app.constants import constant
from app.constants.setu_events import SetuEventTypes
from app.models.consent_request import ConsentRequest, ConsentStatus
from app.models.consent_cancellation_log import ConsentCancellationLog, CancelledBy
from app.models.consent_fI_type import ConsentFITypeStatus
from app.utils.logger_util import (
    logger_info, logger_debug, logger_error, logger_exception, logger_success, logger_warning
)
from app.constants.message import Messages
from app.utils.helper import to_utc_z_format


class SetuService:
    """Service responsible for interacting with Setu AA & PAN APIs."""

    def __init__(self, db: Optional[Session] = None):
        cfg = settings.setu

        # PAN
        self._pancard_client_id = cfg.SETU_PANCARD_CLIENT_ID
        self._pancard_client_secret = cfg.SETU_PANCARD_CLIENT_SECRET
        self._pancard_product_instance_id = cfg.SETU_PANCARD_PRODUCT_INSTANCE_ID

        # AA
        self._aa_client_id = cfg.SETU_AA_CLIENT_ID
        self._aa_client_secret = cfg.SETU_AA_CLIENT_SECRET
        self._aa_product_instance_id = cfg.SETU_AA_PRODUCT_INSTANCE_ID

        self.db = db

    # ===========================================================================================
    #   INTERNAL REQUEST WRAPPER
    # ===========================================================================================
    def _request(
        self,
        method: str,
        url: str,
        *,
        headers: Optional[dict] = None,
        json: Optional[dict] = None,
        timeout: int = 10,
        expected_status: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        A safe wrapper around requests to enforce consistent error handling and logging.
        """
        try:
            response = requests.request(
                method.upper(),
                url,
                headers=headers,
                json=json,
                timeout=timeout
            )
        except RequestException as exc:
            logger_exception(f"HTTP {method} {url} failed: {exc}")
            raise RuntimeError(f"Connection failed: {exc}") from exc

        if expected_status and response.status_code != expected_status:
            logger_error(
                f"Unexpected response code {response.status_code} | {response.text}",
                url=url,
                status_code=response.status_code
            )
            raise RuntimeError(
                f"API error {response.status_code} | {response.text}"
            )

        try:
            return response.json()
        except (JSONDecodeError, ValueError):
            logger_error(f"Invalid JSON response from: {url}")
            raise RuntimeError("Non-JSON response received")

    # ===========================================================================================
    #   PAN VERIFICATION
    # ===========================================================================================
    def verify_pancard(self, pancard: str, consent: str) -> bool:
        payload = {"pan": pancard, "consent": consent, "reason": "For User Pan Verification"}
        headers = {
            "x-client-id": self._pancard_client_id,
            "x-client-secret": self._pancard_client_secret,
            "x-product-instance-id": self._pancard_product_instance_id,
            "Content-Type": "application/json",
        }

        logger_info("Sending PAN verification request", pan=pancard)

        data = self._request(
            "POST",
            SetuAPI.PAN_VERIFICATION_API,
            json=payload,
            headers=headers,
            expected_status=status.HTTP_200_OK,
        )

        status_value = data.get("verification", "").lower()

        if status_value == constant.SUCCESS:
            logger_success("PAN verified", pan=pancard)
            return True

        if status_value == constant.FAILED:
            logger_info("PAN verification failed", pan=pancard)
            return False

        logger_error("Unexpected PAN status", status=status_value)
        raise RuntimeError(f"Unexpected PAN verification status: {status_value}")

    # ===========================================================================================
    #   AA AUTH TOKEN
    # ===========================================================================================
    def get_aa_token(self) -> str:
        payload = {
            "clientId": self._aa_client_id,
            "secret": self._aa_client_secret,
            "grant_type": "client_credentials",
        }

        headers = {"client": "bridge", "Content-Type": "application/json"}

        data = self._request("POST", SetuAPI.AA_AUTH_TOKEN, json=payload, headers=headers)

        if not data.get("success"):
            raise RuntimeError("AA Auth returned unsuccessful response")

        token = data.get("data", {}).get("token")

        if not token:
            raise RuntimeError("Missing AA token")
        return token

    # ===========================================================================================
    #   CREATE CONSENT
    # ===========================================================================================
    def create_consent(
        self,
        phone: str,
        pancard: str,
        start_date: str,
        end_date: str,
        fi_type: list,
        consent_duration: dict,
        fetch_type: str,
        frequency: Optional[dict] = None,
    ):
        token = self.get_aa_token()

        payload = {
            "consentDuration": {
                "unit": consent_duration.get("unit"),
                "value": consent_duration.get("value")
            },
            "PAN": pancard,
            "vua": phone,
            "dataRange": {"from": start_date, "to": end_date},
            "purpose": {
                "code": "101",
                "text": "Wealth management service",
                "refUri": "https://api.rebit.org.in/aa/purpose/101.xml",
                "category": {"type": "Wealth management service"},
            },
            "fiTypes": fi_type,
            "fetchType": fetch_type,
        }

        if fetch_type.upper() == "PERIODIC" and frequency:
            payload["frequency"] = {
                "unit": frequency["unit"],
                "value": frequency["value"]
            }

        headers = {
            "x-product-instance-id": self._aa_product_instance_id,
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }

        data = self._request("POST", SetuAPI.CREATE_CONSENT_API, json=payload, headers=headers)

        logger_success("Consent created", phone=phone)
        return data

    # ===========================================================================================
    #   CONSENT CANCELLATION HANDLER
    # ===========================================================================================
    def handle_consent_cancellation(self, error: Dict[str, Any], consent_id: str):
        if not consent_id:
            logger_warning("Missing consent_id")
            return

        error_code = error.get("code")
        error_message = error.get("message")

        logger_info("Handling cancellation", consent_id=consent_id)

        consent = (
            self.db.query(ConsentRequest)
            .filter(ConsentRequest.consent_id == consent_id)
            .first()
        )

        if not consent:
            logger_warning("Consent request not found", consent_id=consent_id)
            return

        if error_code not in SetuEventTypes.SETU_CONSNET_CANCELATION_EVENTS:
            logger_info("Received non-cancellation error", consent_id=consent_id)
            return

        message = self._get_cancellation_message(error_code, error_message)

        try:
            consent.status = ConsentStatus.REJECTED

            for fi in consent.fi_types:
                fi.status = ConsentFITypeStatus.EXPIRE

            log = ConsentCancellationLog(
                consent_request_id=consent.id,
                reason=message,
                cancelled_by=CancelledBy.USER
            )

            self.db.add(log)
            self.db.commit()

            logger_success("Consent cancelled", consent_id=consent_id)

        except Exception:
            self.db.rollback()
            logger_exception("Failed to process cancellation")
            raise

    # ===========================================================================================
    #   CONSENT STATUS UPDATE
    # ===========================================================================================
    def update_consent_status(self, consent_id: str, status_value: str, user_service=None):
        if not consent_id:
            logger_warning("Missing consent_id")
            return

        consent = (
            self.db.query(ConsentRequest)
            .filter(ConsentRequest.consent_id == consent_id)
            .first()
        )

        if not consent:
            logger_warning("Consent not found", consent_id=consent_id)
            return

        try:
            consent.status = ConsentStatus(status_value)
            self.db.commit()

            if status_value == constant.CAP_ACTIVE:
                self._create_data_session(consent, user_service=user_service)

            logger_success("Consent status updated", id=consent_id)

        except Exception:
            self.db.rollback()
            logger_exception("Failed updating consent")
            raise

    # ===========================================================================================
    #   CREATE DATA SESSION
    # ===========================================================================================
    def _create_data_session(self, consent: ConsentRequest, user_service=None):
        token = self.get_aa_token()

        payload = {
            "consentId": consent.consent_id,
            "dataRange": {
                "from": to_utc_z_format(consent.data_range_from),
                "to": to_utc_z_format(consent.data_range_to),
            },
            "format": "json"
        }

        headers = {
            "Authorization": f"Bearer {token}",
            "x-product-instance-id": self._aa_product_instance_id,
            "Content-Type": "application/json",
        }

        data = self._request(
            "POST",
            SetuAPI.CREATE_DATA_SESSION_API,
            json=payload,
            headers=headers,
            expected_status=status.HTTP_201_CREATED
        )

        if user_service:
            try:
                user_service.create_user_data_session(
                    consent_request=consent,
                    session_data=data
                )
            except Exception as e:
                logger_error("Failed saving session", error=str(e))

    # ===========================================================================================
    #   FIP IDs
    # ===========================================================================================
    def fetch_fip_ids(self) -> List[Dict[str, Any]]:
        token = self.get_aa_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        data = self._request("GET", SetuAPI.FETCH_FIP_ID_API, headers=headers)

        fips = data.get("data")

        if not isinstance(fips, list):
            raise RuntimeError("Invalid FIP API response")

        return fips

    # ===========================================================================================
    #   SESSION DATA
    # ===========================================================================================
    def fetch_session_data(self, session_id: str) -> Dict[str, Any]:
        token = self.get_aa_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "x-product-instance-id": self._aa_product_instance_id,
            "Content-Type": "application/json",
        }

        url = SetuAPI.FETCH_SESSION_DATA_API.format(session_id=session_id)

        return self._request("GET", url, headers=headers)

    # ===========================================================================================
    #   PRIVATE HELPERS
    # ===========================================================================================
    def _get_cancellation_message(self, error_code: str, error_message: str) -> str:
        return (
            SetuEventTypes.SETU_CONSENT_CANCELLATION_LOG_MESSAGE.get(error_message)
            or Messages.UNKNOWN_ERROR
        )
