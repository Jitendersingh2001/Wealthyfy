from pydantic_settings import BaseSettings
from urllib.parse import quote_plus

class AppSettings(BaseSettings):
    APP_NAME: str
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_PORT: int = 8000


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
        return f"{self.DB_CONNECTION}+{self.DB_DRIVER}://{self.DB_USERNAME}:{password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_DATABASE}"

class KeycloakSettings(BaseSettings):
    KEYCLOAK_URL: str
    KEYCLOAK_REALM: str
    KEYCLOAK_CLIENT_ID: str
    KEYCLOAK_CLIENT_SECRET: str
    
class Settings(BaseSettings):
    app: AppSettings
    db: DatabaseSettings
    keycloak: KeycloakSettings

    class Config:
        env_file = ".env"
        case_sensitive = True
        env_nested_delimiter = "__"


settings = Settings()
