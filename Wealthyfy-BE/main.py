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
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

# Routers & Utilities
from app.api import router as api_router
from app.utils.response import error_response

# Scheduler
from app.jobs.scheduler.scheduler import start_scheduler, stop_scheduler


# ------------------------------------------------------------
# Lifespan Handler (Startup + Shutdown)
# ------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- STARTUP ----
    start_scheduler()  # initialize APScheduler jobs

    yield   # FastAPI runs

    # ---- SHUTDOWN ----
    stop_scheduler()   # graceful scheduler shutdown


# ------------------------------------------------------------
# Create FastAPI App
# ------------------------------------------------------------
app = FastAPI(
    title="Todo App",
    lifespan=lifespan
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
