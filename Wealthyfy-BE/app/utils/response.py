# app/utils/response.py

from fastapi.responses import JSONResponse
from fastapi import status
from fastapi.encoders import jsonable_encoder
from app.schemas.response import ApiResponse


def success_response(data=None, message: str = None, status_code: int = status.HTTP_200_OK):
    # Convert SQLAlchemy models / datetimes / enums into safe JSON types
    safe_data = jsonable_encoder(data)

    return JSONResponse(
        status_code=status_code,
        content=ApiResponse(
            success=True,
            data=safe_data,
            message=message
        ).model_dump()
    )


def error_response(message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
    return JSONResponse(
        status_code=status_code,
        content=ApiResponse(
            success=False,
            data=None,
            message=message
        ).model_dump()
    )
