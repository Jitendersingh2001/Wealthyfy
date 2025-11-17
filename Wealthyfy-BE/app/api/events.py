from fastapi import APIRouter, Request, HTTPException, status, Depends
from typing import Dict, Any
from app.constants.keyclock import KeyclockEventTypes
from app.services.user_services import UserService
from app.services.keyclock_service import KeycloakService
from app.config.database import get_db 
from sqlalchemy.orm import Session
from app.utils.logger_util import (
    logger_info, logger_debug, logger_warning, logger_exception
)

router = APIRouter(prefix="/events", tags=["Callback Events"])

@router.post("/keyclock_events")
async def handle_keycloak_event(request: Request,db: Session = Depends(get_db)):
    """
    Endpoint to handle Keycloak event notifications.
    Logs the received payload and responds with an acknowledgment.
    """
    try:
        user_service = UserService(db)
        keycloak_service = KeycloakService()
        # Parse incoming JSON payload
        payload: Dict[str, Any] = await request.json()
        logger_debug(f"Raw event payload: {payload}")
        event_type = payload.get("type", "UNKNOWN")

        logger_info(f"Received Keycloak event: {event_type}", event_type=event_type)
        logger_debug(f"Raw event payload: {payload}")

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
    
@router.post("/setu_events",)
async def setu_events(request: Request,db: Session = Depends(get_db)):
    """
    setu endpoint to log incoming event payloads.
    """
    try:
        # Parse incoming JSON payload
        payload: Dict[str, Any] = await request.json()
        logger_info(f"Received setu event payload: {payload}")
        return {"status": "received", "payload": payload}

    except Exception as e:
        logger_exception("Failed to process setu event")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing event: {str(e)}",
        )