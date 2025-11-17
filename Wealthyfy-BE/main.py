# Configure logging FIRST before any other imports
from app.config.logger import setup_logging
setup_logging()

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api import router as api_router
from app.utils.response import error_response

app = FastAPI(title="Todo App")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000","https://wealthyfy.pagekite.me"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Todo App!"}


# GLOBAL VALIDATION ERROR HANDLER
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    """
    This converts FastAPI's default 422 validation response
    into our unified ApiResponse error format.
    """
    errors = exc.errors()

    # Extract meaningful message
    detail = errors[0].get("msg", "Invalid input")

    return error_response(
        message=detail,
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT
    )
