from celery.schedules import crontab

beat_schedule = {
    "daily-fip-sync": {
        "task": "sync_fip_master_data",
        "schedule": crontab(hour=2, minute=0),
    }
}
