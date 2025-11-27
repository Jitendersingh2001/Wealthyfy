import pkgutil
import importlib
from celery import Celery
from app.config.setting import settings
from app.jobs import tasks as tasks_pkg
from app.jobs import scheduler as scheduler_pkg
from app.config.logger import setup_logging

# ---------------------------------------------------------
# Initialize centralized logging FOR CELERY WORKERS
# ---------------------------------------------------------
setup_logging()

# ---------------------------------------------------------
# Create Celery app instance
# ---------------------------------------------------------
celery_app = Celery(
    "wealthyfy",
    broker=settings.celery.CELERY_BROKER_URL,
    backend=settings.celery.CELERY_RESULT_BACKEND,
)

# ---------------------------------------------------------
# Celery Base Configuration
# ---------------------------------------------------------
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_hijack_root_logger=False,
)


# ----------------------------
# Task Autoloading
# Each task file must contain a `register(celery_app)` function
# ----------------------------
for module in pkgutil.iter_modules(tasks_pkg.__path__):
    module_name = f"app.jobs.tasks.{module.name}"
    mod = importlib.import_module(module_name)

    if hasattr(mod, "register"):
        mod.register(celery_app)


# ---------------------------------------------------------
# Schedule Autodiscovery
# Each scheduler file must contain a `register(celery_app)` function
# ---------------------------------------------------------
for module in pkgutil.iter_modules(scheduler_pkg.__path__):
    mod = importlib.import_module(f"app.jobs.scheduler.{module.name}")

    if hasattr(mod, "register"):
        mod.register(celery_app)
