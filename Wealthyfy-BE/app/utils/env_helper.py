class EnvHelper:
    """Utility class to check and manage the current environment."""

    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"

    def __init__(self, current: str):
        self.current = current.lower().strip()

    @property
    def is_dev(self) -> bool:
        return self.current == self.DEVELOPMENT

    @property
    def is_staging(self) -> bool:
        return self.current == self.STAGING

    @property
    def is_prod(self) -> bool:
        return self.current == self.PRODUCTION

    @property
    def is_test(self) -> bool:
        return self.current == self.TESTING
