from fastapi import APIRouter, status, Depends, HTTPException, Form
from app.dependencies.auth import authenticate_user
from app.services.pusher_service import PusherService

router = APIRouter(prefix="/pusher", tags=["WebSockets"])
pusher_service = PusherService()

@router.post("/auth")
def pusher_auth(
    channel_name: str = Form(...),
    socket_id: str = Form(...),
    current_user=Depends(authenticate_user)
):
    try:
        return pusher_service.authenticate(
            user_id=current_user.id,
            channel=channel_name,
            socket_id=socket_id,
        )
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized channel access")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
