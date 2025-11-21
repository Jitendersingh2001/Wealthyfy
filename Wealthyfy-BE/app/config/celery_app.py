from celery import Celery
from app.config.setting import settings
import pkgutil
import importlib
from app.jobs import scheduler as scheduler_pkg


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
)


# ---------------------------------------------------------
# Auto-discover all tasks in app/jobs/tasks/*
# ---------------------------------------------------------
celery_app.autodiscover_tasks(["app.jobs.tasks"])



# ---------------------------------------------------------
# Auto-discover all Celery Beat schedules from app/jobs/scheduler/*
# Each file must contain a dict variable named `beat_schedule`
# ---------------------------------------------------------
beat_schedule = {}

for module in pkgutil.iter_modules(scheduler_pkg.__path__):
    module_name = f"app.jobs.scheduler.{module.name}"
    mod = importlib.import_module(module_name)

    if hasattr(mod, "beat_schedule"):
        beat_schedule.update(mod.beat_schedule)

celery_app.conf.beat_schedule = beat_schedule
