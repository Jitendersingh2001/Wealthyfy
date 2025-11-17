"""
Centralized logging configuration.
"""
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from datetime import datetime


class SeparatedFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        separator = f"/* {'-' * 150} */"
        return f"{separator}\n{super().format(record)}"


def setup_logging(
    level: int = logging.INFO,
    log_dir: str = "logs",
    log_prefix: str = "app",
    max_bytes: int = 10 * 1024 * 1024,
    backup_count: int = 5,
):
    # Suppress noisy loggers upfront
    for name in (
        "sqlalchemy.engine", "sqlalchemy.pool", "sqlalchemy.dialects",
        "sqlalchemy.orm", "sqlalchemy", "uvicorn", "uvicorn.access"
    ):
        logger = logging.getLogger(name)
        logger.setLevel(logging.WARNING)
        logger.propagate = False

    date_str = datetime.now().strftime("%Y-%m-%d")
    log_file = f"{log_prefix}_{date_str}.log"

    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    root_logger.handlers.clear()

    # Formatters
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    time_format = "%Y-%m-%d %H:%M:%S"
    console_fmt = logging.Formatter(log_format, time_format)
    file_fmt = SeparatedFormatter(log_format, time_format)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(console_fmt)
    root_logger.addHandler(console_handler)

    # File handler
    Path(log_dir).mkdir(exist_ok=True)
    file_handler = RotatingFileHandler(
        filename=Path(log_dir) / log_file,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding="utf-8",
    )
    file_handler.setFormatter(file_fmt)
    root_logger.addHandler(file_handler)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
