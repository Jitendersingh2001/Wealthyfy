from app.config.setting import settings


class SetuAPI:
    _settings = settings.setu

    PAN_VERIFICATION_API = f"{_settings.SETU_PANCARD_BASE_URL}/api/verify/pan"
