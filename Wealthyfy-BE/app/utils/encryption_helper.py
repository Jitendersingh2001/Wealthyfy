import os
from cryptography.fernet import Fernet
from typing import Optional
from app.config.setting import settings


def _load_key() -> bytes:
    """
    Load the encryption key from environment variable.
    This ensures the key is not hard-coded in the codebase.
    """
    key = settings.app.APP_ENCRYPTION_KEY

    if not key:
        raise RuntimeError(
            "PAN_ENCRYPTION_KEY is not set. Generate a key using "
            "`from cryptography.fernet import Fernet; Fernet.generate_key()` "
            "and store it securely."
        )

    return key.encode()


# Create a single Fernet instance for the entire app
fernet = Fernet(_load_key())


def encrypt_value(value: Optional[str]) -> Optional[str]:
    """
    Encrypts a plain text string and returns encrypted text.
    Safe to reuse in any part of the application.
    """
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError("encrypt_value expects a string input.")

    return fernet.encrypt(value.encode()).decode()


def decrypt_value(value: Optional[str]) -> Optional[str]:
    """
    Decrypts an encrypted string and returns plain text.
    Safe to reuse across the application.
    """
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError("decrypt_value expects a string input.")

    return fernet.decrypt(value.encode()).decode()
