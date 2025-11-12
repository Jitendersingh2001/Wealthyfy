import re
from typing_extensions import Annotated
from pydantic import BeforeValidator
from pydantic_core import PydanticCustomError
from app.constants.regex import PAN_REGEX


def validate_pan(value: str) -> str:
    """Ensure PAN follows the ABCDE1234F format."""
    if not re.match(PAN_REGEX, value):
        raise PydanticCustomError(
            "invalid_pan",
            "Invalid PAN card format. Expected: ABCDE1234F"
        )
    return value


# Custom Pydantic type for PAN card validation
PanCard = Annotated[str, BeforeValidator(validate_pan)]
