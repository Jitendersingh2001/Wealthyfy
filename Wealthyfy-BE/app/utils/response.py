# app/utils/response.py
from app.schemas.response import ApiResponse

def success_response(data=None, message: str = None):
    return ApiResponse(success=True, data=data, message=message)

def error_response(message: str):
    return ApiResponse(success=False, data=None, message=message)
