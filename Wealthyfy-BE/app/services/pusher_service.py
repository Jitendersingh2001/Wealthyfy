from pusher import Pusher
from app.config.setting import settings
from app.utils.logger_util import (
    logger_info, logger_exception
)

# ===========================================================================
# Pusher Service
# ===========================================================================
class PusherService:
    # -----------------------------------------------------------------------
    # Initialization
    # -----------------------------------------------------------------------
    def __init__(self):
        """Initialize the Pusher client with configuration from settings."""
        self._client = Pusher(
            app_id=settings.pusher.PUSHER_APP_ID,
            key=settings.pusher.PUSHER_KEY,
            secret=settings.pusher.PUSHER_SECRET,
            cluster=settings.pusher.PUSHER_CLUSTER,
            ssl=settings.pusher.PUSHER_SSL,
        )
    
    # -----------------------------------------------------------------------
    # Authentication for Private Channels
    # -----------------------------------------------------------------------
    def authenticate(self, channel: str, socket_id: str, user_id: int) -> dict:
        """
        Securely authenticate the user for a private Pusher channel.

        Ensures that users can only authenticate their own private channel.
        Raises:
            PermissionError: If unauthorized channel access is detected.
        Returns:
            dict: Authentication payload for Pusher.
        """
        expected_channel = f"private-user-{user_id}"
        if channel != expected_channel:
            raise PermissionError("Unauthorized channel access")
        return self._client.authenticate(channel=channel, socket_id=socket_id)
    
    # -----------------------------------------------------------------------
    # Trigger Events
    # -----------------------------------------------------------------------
    def trigger(self, user_id: int, event: str, data: dict):
        """
        Trigger an event for a specific user via their private channel.

        Logs success or captures and logs any exceptions.
        """
        channel = f"private-user-{user_id}"
        try:
            self._client.trigger(channel, event, data)
            logger_info(f"Triggered event '{event}' for user {user_id}")
        except Exception as e:
            logger_exception("Failed to trigger pusher event", exc_info=e)
            raise
