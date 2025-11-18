from fastapi import APIRouter, status, Depends, HTTPException
from app.schemas.response import ApiResponse
from app.utils.response import success_response, error_response
from app.dependencies.auth import authenticate_user
from app.services.pusher_service import PusherService
from app.schemas.pusher import PusherAuthRequest

# ===========================================================================
# Router Definition
# ===========================================================================
router = APIRouter(
    prefix="/pusher",
    tags=["WebSockets"]
)

# ===========================================================================
# Pusher Service Instance
# ===========================================================================
pusher_service = PusherService()

# ===========================================================================
# Pusher Endpoints
# ===========================================================================

@router.post("/auth")
def pusher_auth(req: PusherAuthRequest, current_user=Depends(authenticate_user)):
    try:
        return pusher_service.authenticate(
            user_id=current_user.id,
            channel=req.channel_name,
            socket_id=req.socket_id,
        )
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized channel access")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))