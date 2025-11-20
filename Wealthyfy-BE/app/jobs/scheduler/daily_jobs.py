from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from app.jobs.tasks.fip_tasks import sync_fip_master_data
from app.config.setting import settings


def register_daily_jobs(scheduler):

    scheduler.add_job(
        sync_fip_master_data,
        CronTrigger(hour=2, minute=0),
        name="daily_fip_sync",
        replace_existing=True,
    )
