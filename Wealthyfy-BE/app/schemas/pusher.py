from pydantic import BaseModel

class PusherAuthRequest(BaseModel):
    channel_name: str
    socket_id: str
