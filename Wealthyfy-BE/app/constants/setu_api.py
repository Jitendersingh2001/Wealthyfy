from app.config.setting import settings


class SetuAPI:
    _settings = settings.setu

    PAN_VERIFICATION_API = f"{_settings.SETU_PANCARD_BASE_URL}/api/verify/pan"
    CREATE_CONSENT_API = f"{_settings.SETU_AA_BASE_URL}/consents"
    AA_AUTH_TOKEN = "https://uat.setu.co/api/v2/auth/token"