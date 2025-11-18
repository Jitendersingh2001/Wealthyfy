import requests
from requests.exceptions import JSONDecodeError
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import status
from datetime import datetime
from app.config.setting import settings
from app.constants.setu_api import SetuAPI
from app.constants import constant
from app.constants.setu_events import SetuEventTypes
from app.models.consent_request import ConsentRequest, ConsentStatus
from app.models.consent_cancellation_log import ConsentCancellationLog, CancelledBy
from app.models.consent_fI_type import ConsentFITypeStatus
from app.services.user_services import UserService
from app.utils.logger_util import (
    logger_info, logger_debug, logger_error, logger_exception, logger_success, logger_warning
)
from app.constants.message import Messages
from app.utils.helper import to_utc_z_format



class SetuService:
    """Handles interactions with Setu APIs such as PAN verification and AA token generation."""

    # -----------------------------------------------------------------------
    # Initialization
    # -----------------------------------------------------------------------
    def __init__(self, db: Optional[Session] = None):
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

        # Database session (optional for backward compatibility)
        self.db = db

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

        logger_info(f"Sending PAN verification request", pan=pancard)

        try:
            response = requests.post(
                SetuAPI.PAN_VERIFICATION_API,
                json=payload,
                headers=headers,
                timeout=10,
            )
        except requests.exceptions.RequestException as exc:
            logger_exception("Connection to Setu PAN Verification API failed")
            raise RuntimeError(
                f"Failed connecting to PAN verification service: {exc}"
            ) from exc

        if response.status_code != status.HTTP_200_OK:
            logger_error(
                f"Invalid PAN verification response: {response.status_code} | {response.text}",
                status_code=response.status_code,
                pan=pancard
            )
            raise RuntimeError(
                f"PAN verification API error: {response.status_code} | {response.text}"
            )

        try:
            result = response.json()
            logger_debug(f"PAN verification API response: {result}")
        except ValueError:
            logger_error(
                "Non-JSON response received from PAN API", pan=pancard)
            raise RuntimeError(
                "Invalid JSON response from PAN verification API")

        verification_status = result.get("verification", "").lower()

        if verification_status == constant.SUCCESS:
            logger_success(f"PAN verification successful", pan=pancard)
            return True

        if verification_status == constant.FAILED:
            logger_info(f"PAN verification failed", pan=pancard)
            return False

        logger_error(
            f"Unexpected verification status: {verification_status}", status=verification_status)
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
            logger_debug(f"AA token API response: {data}")

        except requests.exceptions.RequestException as exc:
            logger_exception("Connection to Setu AA Auth API failed")
            raise RuntimeError(
                f"Failed connecting to auth token: {exc}") from exc
        except ValueError:
            logger_error("Non-JSON response received from AA token API")
            raise RuntimeError(
                "Invalid JSON response received from AA Auth API")

        if not data.get("success", False):
            logger_error("Setu AA Auth API returned unsuccessful status")
            raise RuntimeError("Auth API returned unsuccessful status")

        token = data.get("data", {}).get("token")

        if not token:
            logger_error("Token missing from Setu AA Auth response")
            raise RuntimeError("Token not found in the auth response")

        logger_success("Successfully retrieved AA token")
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
            data = response.json()
            logger_success("Consent created successfully", phone=phone_number)
            return data
        except requests.exceptions.RequestException as exc:
            logger_exception("Connection to Setu Create Consent API failed")
            raise RuntimeError(
                f"Failed connecting to create consent API: {exc}") from exc

    # -----------------------------------------------------------------------
    # Handle Setu Consent Cancellation Events
    # -----------------------------------------------------------------------
    def handle_consent_cancellation(self, error: Dict[str, Any], consent_id: str):
        """
        Handle consent cancellation when an error occurs in Setu events.
        
        Args:
            error: Error dictionary containing code and message
            consent_id: The consent ID from Setu
        """

        if not consent_id:
            logger_warning(
                "Consent ID is missing, cannot process cancellation")
            return

        try:
            # Extract error code and message
            error_code = error.get("code", "")
            error_message = error.get("message", "")

            logger_info(
                f"Processing consent cancellation",
                consent_id=consent_id,
                error_code=error_code,
                error_message=error_message
            )

            # Find the consent request by consent_id
            consent_request = (
                self.db.query(ConsentRequest)
                .filter(ConsentRequest.consent_id == consent_id)
                .first()
            )

            if not consent_request:
                logger_warning(
                    f"Consent request not found for consent_id: {consent_id}")
                return

            # Check if error code matches any cancellation event
            is_cancellation_event = error_code in SetuEventTypes.SETU_CONSNET_CANCELATION_EVENTS

            if is_cancellation_event:
                # Map error code to cancellation message
                cancellation_message = self._get_cancellation_message(
                    error_code, error_message)

                # Update consent status to REJECTED
                consent_request.status = ConsentStatus.REJECTED

                # Expire all associated FI types
                for fi_type in consent_request.fi_types:
                    fi_type.status = ConsentFITypeStatus.EXPIRE

                # Create cancellation log entry
                cancellation_log = ConsentCancellationLog(
                    consent_request_id=consent_request.id,
                    reason=cancellation_message,
                    cancelled_by=CancelledBy.USER
                )
                self.db.add(cancellation_log)
                self.db.commit()

                logger_success(
                    f"Consent cancelled and status updated to REJECTED",
                    consent_id=consent_id,
                    error_code=error_code
                )
            else:
                # For non-cancellation errors, log but don't change status
                logger_info(
                    f"Error received but not a cancellation event",
                    consent_id=consent_id,
                    error_code=error_code
                )

        except Exception as e:
            logger_exception(
                f"Failed to handle consent cancellation for consent_id: {consent_id}")
            if self.db:
                self.db.rollback()
            raise

    # -----------------------------------------------------------------------
    # Get Cancellation Message
    # -----------------------------------------------------------------------
    def _get_cancellation_message(self, error_code: str, error_message: str) -> str:
        # First, check if error_message is a valid key in the constants
        if error_message and error_message in SetuEventTypes.SETU_CONSENT_CANCELLATION_LOG_MESSAGE:
            return SetuEventTypes.SETU_CONSENT_CANCELLATION_LOG_MESSAGE[error_message]

        return Messages.UNKNOWN_ERROR

    # -----------------------------------------------------------------------
    # Update Consent Status
    # -----------------------------------------------------------------------
    def update_consent_status(self, consent_id: str, consent_status: str):
        """
        Update the consent status in the database based on Setu event.

        Args:
            consent_id: The consent ID from Setu
            consent_status: The new consent status to update
        """

        if not consent_id:
            logger_warning("Consent ID is missing, cannot update status")
            return

        try:
            logger_info(
                f"Updating consent status",
                consent_id=consent_id,
                consent_status=consent_status
            )

            # Find the consent request by consent_id
            consent_request = (
                self.db.query(ConsentRequest)
                .filter(ConsentRequest.consent_id == consent_id)
                .first()
            )

            if not consent_request:
                logger_warning(
                    f"Consent request not found for consent_id: {consent_id}")
                return

            # Update the consent status
            consent_request.status = ConsentStatus(consent_status)
            self.db.commit()
            self.db.refresh(consent_request)

            logger_success(
                f"Consent status updated successfully",
                consent_id=consent_id,
                new_status=consent_status
            )
            if consent_status == constant.CAP_ACTIVE:
                self._create_data_session(consent_request)
        except Exception as e:
            logger_exception(
                f"Failed to update consent status for consent_id: {consent_id}")
            if self.db:
                self.db.rollback()
            raise

    # -----------------------------------------------------------------------
    # Create Data Session
    # -----------------------------------------------------------------------
    def _create_data_session(self, consent_request: ConsentRequest):
        """
        Create a data session when consent becomes ACTIVE.

        Args:
            consent_request: The ConsentRequest object
        """

        try:
            # Logic to create data session goes here
            # For demonstration, we just log the action
            logger_info(
                f"Creating data session for ACTIVE consent",
                consent_request=consent_request
            )
            consent_id = consent_request.consent_id
            data_start_date = to_utc_z_format(consent_request.data_range_from)
            data_end_date = to_utc_z_format(consent_request.data_range_to)
            token = self.get_aa_token()
            payload = {
                "consentId": consent_id,
                "dataRange": {
                    "to": data_end_date,
                    "from": data_start_date
                },
                "format": "json"
            }

            headers = {
                "x-product-instance-id": self._aa_product_instance_id,
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            }
            
            response = requests.post(
                SetuAPI.CREATE_DATA_SESSION_API, json=payload, headers=headers, timeout=10
            )
            
            if response.status_code != status.HTTP_201_CREATED:
                logger_error(
                    f"Invalid data session response: {response.status_code} | {response.text}",
                    status_code=response.status_code,
                    consent_id=consent_id
                )
                raise RuntimeError(
                    f"Data session API error: {response.status_code} | {response.text}"
                )
            
            try:
                data = response.json()
                logger_info(f"Data session API response: {data}")
            except (ValueError, JSONDecodeError) as json_err:
                logger_error(
                    f"Non-JSON response received from data session API: {response.text}",
                    consent_id=consent_id
                )
                raise RuntimeError(
                    f"Failed to parse data session API response as JSON: {json_err}"
                ) from json_err

            try:
                user_service = UserService(self.db)
                user_service.create_user_data_session(
                        consent_request=consent_request,
                        session_data=data
                    )
            except Exception as db_err:
                logger_error(
                        f"Failed to save data session to database: {db_err}",
                        consent_id=consent_id,
                        session_id=data.get("id")
                    )


            logger_success(
                f"Consent is now ACTIVE",
                consent_request=consent_request
            )

        except Exception as e:
            logger_exception(
                f"Failed to create data session for consent_id: {consent_request.consent_id}")