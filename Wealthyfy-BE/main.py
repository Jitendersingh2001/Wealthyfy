# ------------------------------------------------------------
# Configure logging FIRST before any other imports
# ------------------------------------------------------------
from app.config.logger import setup_logging
setup_logging()

# ------------------------------------------------------------
# Standard Imports
# ------------------------------------------------------------
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

# Routers & Utilities
from app.api import router as api_router
from app.utils.response import error_response
from fastapi_pagination import add_pagination

# Celery Beat schedule (import to register periodic tasks)
from app.config.celery_app import celery_app # noqa: F401


# ------------------------------------------------------------
# Create FastAPI App
# ------------------------------------------------------------
app = FastAPI(
    title="Todo App",
)


# ------------------------------------------------------------
# CORS Middleware
# ------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://wealthyfy.pagekite.me"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------
# Register Routers
# ------------------------------------------------------------
app.include_router(api_router)

# ------------------------------------------------------------
# Add Pagination Support
# ------------------------------------------------------------
add_pagination(app)


# ------------------------------------------------------------
# Root Route
# ------------------------------------------------------------
@app.get("/")
def read_root():
    return {"message": "Welcome to Todo App!"}


# ------------------------------------------------------------
# Global Validation Error Handler
# ------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    """
    Convert FastAPI's default 422 validation message
    into our unified JSON API response format.
    """

    errors = exc.errors()
    detail = errors[0].get("msg", "Invalid input")

    return error_response(
        message=detail,
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT
    )
