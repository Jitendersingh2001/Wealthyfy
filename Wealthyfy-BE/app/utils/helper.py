from datetime import datetime, timezone

def to_utc_z_format(dt: datetime) -> str:
    """
    Convert a datetime to UTC and return it in `YYYY-MM-DDTHH:MM:SSZ` format.
    Works with both naive and timezone-aware datetime objects.
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)

    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
