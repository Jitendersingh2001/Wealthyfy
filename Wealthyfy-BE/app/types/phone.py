import re
from typing_extensions import Annotated
from pydantic import BeforeValidator
from pydantic_core import PydanticCustomError
from app.constants.regex import PHONE_NO_REGEX


def validate_phone(value: str) -> str:
    """Ensure phone number matches 10-digit Indian format."""
    if not re.match(PHONE_NO_REGEX, value):
        raise PydanticCustomError(
            "invalid_phone_number",
            "Invalid phone number format. Must be a 10-digit Indian mobile number."
        )
    return value


# Custom Pydantic type for reusability
PhoneNumber = Annotated[str, BeforeValidator(validate_phone)]
