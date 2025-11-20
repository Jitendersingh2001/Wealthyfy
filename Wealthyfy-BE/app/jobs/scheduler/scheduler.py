from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.jobs.scheduler.daily_jobs import register_daily_jobs

scheduler = AsyncIOScheduler()


def start_scheduler():
    register_daily_jobs(scheduler)
    scheduler.start()


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
    