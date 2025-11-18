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
        logger_info(f"Received Keycloak event: {event_type}", event_type=event_type)

        # Handle specific Keycloak event types
        if event_type == KeyclockEventTypes.REGISTER:
            user_data = keycloak_service.process_user(payload)
            if user_data:
                user_service.create_user(user_data)

        elif event_type == KeyclockEventTypes.VERIFY_EMAIL:
            user_service.update_user_status(payload)

        else:
            logger_warning(f"Unhandled event type: {event_type}", event_type=event_type)

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
    try:
        setu_service = SetuService(db)
        user_service = UserService(db)

        payload: Dict[str, Any] = await request.json()
        logger_info(f"Received setu event payload: {payload}")
        event_type = payload.get("type", "UNKNOWN")
        consent_id = payload.get("consentId")
        
        if event_type == SetuEventTypes.SETU_CONSENT_STATUS_EVENT_TYPE:
            if payload.get("error"):
                error = payload.get("error")
                setu_service.handle_consent_cancellation(error, consent_id)
            else:
                consent_status = payload.get("data", {}).get("status").upper()
                setu_service.update_consent_status(consent_id, consent_status)
        elif event_type == SetuEventTypes.SETU_SESSION_STATUS_EVENT_TYPE:
            session_status = payload.get("data", {}).get("status").upper()
            session_id = payload.get("dataSessionId")
            user_service.update_session_status(consent_id, session_id,  session_status)
        else:
            logger_warning(f"Unhandled Setu event type: {event_type}", event_type=event_type)
        return {"status": "received", "payload": payload}

    except Exception as e:
        logger_exception("Failed to process setu event")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing event: {str(e)}",
        )
