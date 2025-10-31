from fastapi import APIRouter, Request, HTTPException, status
from typing import Dict, Any
import logging
from app.constants.keyclock import KeyclockEventTypes


router = APIRouter(prefix="/keycloak", tags=["Keycloak Events"])
logger = logging.getLogger(__name__)

@router.post("/events")
async def handle_keycloak_event(request: Request):
    """
    Endpoint to handle Keycloak event notifications.
    Logs the received payload and responds with an acknowledgment.
    """
    try:
        # Parse incoming JSON payload
        payload: Dict[str, Any] = await request.json()
        event_type = payload.get("type", "UNKNOWN")

        logger.info("📩 Received Keycloak event: %s", event_type)
        logger.debug("Raw event payload: %s", payload)

        # Handle specific Keycloak event types
        if event_type == KeyclockEventTypes.REGISTER:
            logger.info("Processing REGISTER event")
            print("REGISTER event triggered")

        elif event_type == KeyclockEventTypes.VERIFY_EMAIL:
            logger.info("Processing VERIFY_EMAIL event")
            print("VERIFY_EMAIL event triggered")

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
