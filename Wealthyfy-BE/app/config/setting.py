from pydantic_settings import BaseSettings
from urllib.parse import quote_plus


# ---------------------------------------------------------
# App Configuration
# ---------------------------------------------------------
class AppSettings(BaseSettings):
    APP_NAME: str
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_PORT: int = 8000
    APP_ENCRYPTION_KEY: str


# ---------------------------------------------------------
# Database Configuration
# ---------------------------------------------------------
class DatabaseSettings(BaseSettings):
    DB_CONNECTION: str = "postgresql"
    DB_DRIVER: str = "psycopg"
    DB_HOST: str
    DB_PORT: int = 5432
    DB_DATABASE: str
    DB_USERNAME: str
    DB_PASSWORD: str

    @property
    def DB_DATABASE_URL(self) -> str:
        password = quote_plus(self.DB_PASSWORD)
        return (
            f"{self.DB_CONNECTION}+{self.DB_DRIVER}://{self.DB_USERNAME}:{password}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_DATABASE}"
        )


# ---------------------------------------------------------
# Keycloak Configuration
# ---------------------------------------------------------
class KeycloakSettings(BaseSettings):
    KEYCLOAK_URL: str
    KEYCLOAK_REALM: str
    KEYCLOAK_CLIENT_ID: str
    KEYCLOAK_CLIENT_SECRET: str


# ---------------------------------------------------------
# Setu Configuration
# ---------------------------------------------------------
class SetuSettings(BaseSettings):
    # PAN Verification
    SETU_PANCARD_CLIENT_ID: str
    SETU_PANCARD_CLIENT_SECRET: str
    SETU_PANCARD_PRODUCT_INSTANCE_ID: str
    SETU_PANCARD_BASE_URL: str

    # Account Aggregator (AA)
    SETU_AA_BASE_URL: str
    SETU_AA_PRODUCT_INSTANCE_ID: str
    SETU_AA_CLIENT_ID: str
    SETU_AA_CLIENT_SECRET: str


# ---------------------------------------------------------
# Twilio Configuration
# ---------------------------------------------------------
class TwilloSettings(BaseSettings):
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_VERIFICATION_SERVICE_SID: str

# ---------------------------------------------------------
# Pusher Configuration
# ---------------------------------------------------------
class PusherSettings(BaseSettings):
    PUSHER_APP_ID: str
    PUSHER_KEY: str
    PUSHER_SECRET: str
    PUSHER_CLUSTER: str
    PUSHER_SSL: bool = True
# ---------------------------------------------------------
# Celery Configuration
# ---------------------------------------------------------
class CelerySettings(BaseSettings):
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

# ---------------------------------------------------------
# Root Configuration
# ---------------------------------------------------------
class Settings(BaseSettings):
    app: AppSettings
    db: DatabaseSettings
    keycloak: KeycloakSettings
    setu: SetuSettings
    twillo: TwilloSettings
    pusher: PusherSettings
    celery: CelerySettings

    class Config:
        env_file = ".env"
        case_sensitive = True
        env_nested_delimiter = "__"


# Instantiate once and import wherever needed
settings = Settings()
