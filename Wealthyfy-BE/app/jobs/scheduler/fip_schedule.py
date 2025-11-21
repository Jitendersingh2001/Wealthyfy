from celery.schedules import crontab


def register(celery_app):
    celery_app.conf.beat_schedule.update({
        "daily-fip-sync": {
            "task": "sync_fip_master_data",
            "schedule": crontab(hour=2, minute=0),
        }
    })
