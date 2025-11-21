from fastapi import APIRouter, Request, HTTPException, status, Depends
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.constants.keyclock import KeyclockEventTypes
from app.services.user_services import UserService
from app.services.keyclock_service import KeycloakService
from app.config.database import get_db
from app.utils.logger_util import (
    logger_info, logger_debug, logger_warning, logger_exception
)
from app.constants.setu_events import SetuEventTypes
from app.services.setu_service import SetuService

# ===========================================================================
# Router Definition
# ===========================================================================
router = APIRouter(prefix="/events", tags=["Callback Events"])

# ===========================================================================
# Keycloak Event Callback
# ===========================================================================


@router.post("/keyclock_events")
async def handle_keycloak_event(request: Request, db: Session = Depends(get_db)):
    """
    Handles Keycloak event notifications, processes event type, and
    triggers appropriate service actions such as user creation or update.
    """
    try:
        # Service Instances
        user_service = UserService(db)
        keycloak_service = KeycloakService()

        # Parse incoming JSON payload
        payload: Dict[str, Any] = await request.json()
        logger_debug(f"Raw event payload: {payload}")

        event_type = payload.get("type", "UNKNOWN")
        logger_info(
            f"Received Keycloak event: {event_type}", event_type=event_type)

        # Handle specific Keycloak event types
        if event_type == KeyclockEventTypes.REGISTER:
            user_data = keycloak_service.process_user(payload)
            if user_data:
                user_service.create_user(user_data)

        elif event_type == KeyclockEventTypes.VERIFY_EMAIL:
            user_service.update_user_status(payload)

        else:
            logger_warning(
                f"Unhandled event type: {event_type}", event_type=event_type)

        return {"status": "received", "eventType": event_type}

    except Exception as e:
        logger_exception("Failed to process Keycloak event")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing event: {str(e)}",
        )

# ===========================================================================
# Setu Event Callback
# ===========================================================================


@router.post("/setu_events")
async def setu_events(request: Request, db: Session = Depends(get_db)):
    """
    Webhook endpoint to receive asynchronous event notifications from Setu.
    Handles consent-related and session-related lifecycle events.

    The function:
    - Reads and validates the incoming JSON payload.
    - Delegates processing to domain services based on event type.
    - Ensures the system state remains synced with Setu (consent, session).
    """

    try:
        # Services encapsulate all domain/business logic for Setu and User.
        setu_service = SetuService(db)
        user_service = UserService(db)

        # Parse the JSON payload from Setu's webhook POST request.
        payload: Dict[str, Any] = await request.json()
        # logger_info(f"Received setu event payload: {payload}")

        # Extract event type and identifiers for routing.
        event_type = payload.get("type", "UNKNOWN")
        consent_id = payload.get("consentId")

        # -------------------------------
        # Consent Status Event
        # -------------------------------
        if event_type == SetuEventTypes.SETU_CONSENT_STATUS_EVENT_TYPE:

            # If Setu reports an error for the consent, handle its cancellation
            if payload.get("error"):
                error = payload.get("error")
                setu_service.handle_consent_cancellation(error, consent_id)

            else:
                # Extract and normalize the consent status
                consent_status = payload.get("data", {}).get("status").upper()

                # Update the local consent status to remain consistent with Setu.
                setu_service.update_consent_status(consent_id, consent_status, user_service=user_service)

        # -------------------------------
        # Session Status Event
        # -------------------------------
        elif event_type == SetuEventTypes.SETU_SESSION_STATUS_EVENT_TYPE:

            # Read session status (COMPLETED, FAILED, etc.) reported by Setu
            session_status = payload.get("data", {}).get("status").upper()

            # dataSessionId is Setu’s session identifier
            session_id = payload.get("dataSessionId")

            # Update session state mapped to the consent inside the user system
            user_service.update_session_status(
                consent_id,
                session_id,
                session_status,
                setu_service=setu_service
            )

        # -------------------------------
        # Unhandled or Unknown Events
        # -------------------------------
        else:
            # Log events that have no processing logic to detect API changes early.
            logger_warning(
                f"Unhandled Setu event type: {event_type}",
                event_type=event_type
            )

        # Always respond with 200 OK so Setu considers webhook successful.
        return {"status": "received", "payload": payload}

    except Exception as e:
        # In case of any unexpected failure, log and send a controlled API error response.
        logger_exception("Failed to process setu event")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing event: {str(e)}",
        )
