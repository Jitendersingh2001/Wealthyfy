from fastapi import APIRouter, Request, HTTPException, status, Depends
from typing import Dict, Any
import logging
from app.constants.keyclock import KeyclockEventTypes
from app.services.user_services import UserService
from app.services.keyclock_service import KeycloakService
from app.config.database import get_db 
from sqlalchemy.orm import Session



router = APIRouter(prefix="/keycloak", tags=["Keycloak Events"])
logger = logging.getLogger(__name__)

@router.post("/events")
async def handle_keycloak_event(request: Request,db: Session = Depends(get_db)):
    """
    Endpoint to handle Keycloak event notifications.
    Logs the received payload and responds with an acknowledgment.
    """
    try:
        user_service = UserService(db)
        # Parse incoming JSON payload
        payload: Dict[str, Any] = await request.json()
        logger.debug("Raw event payload: %s", payload)
        event_type = payload.get("type", "UNKNOWN")

        logger.info("📩 Received Keycloak event: %s", event_type)
        logger.debug("Raw event payload: %s", payload)

        # Handle specific Keycloak event types
        if event_type == KeyclockEventTypes.REGISTER:
            user_data = KeycloakService.process_user(payload)
            if user_data:
                user_service.create_user(user_data)

        elif event_type == KeyclockEventTypes.VERIFY_EMAIL:
           user_service.update_user_status(payload)


        else:
            logger.warning("Unhandled event type: %s", event_type)
            print("Unhandled event type received")


        return {"status": "received", "eventType": event_type}

    except Exception as e:
        logger.exception("Failed to process Keycloak event")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing event: {str(e)}",
        )