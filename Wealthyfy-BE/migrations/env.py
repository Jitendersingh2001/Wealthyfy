from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys
import os

# --- Step 1: Add app folder to sys.path ---
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# --- Step 2: Import settings and models ---
from app.config.setting import settings
from app.config.database import Base
from app import models  # ensures all model metadata is loaded

# --- Step 3: Alembic Config object ---
config = context.config

# --- Step 4: Set DB URL dynamically from .env / settings.py ---
config.set_main_option("sqlalchemy.url", settings.db.DB_DATABASE_URL.replace('%', '%%'))

# --- Step 5: Logging configuration ---
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- Step 6: Metadata for autogenerate support ---
target_metadata = Base.metadata

# --- Step 7: Migration functions ---
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


# --- Step 8: Entry point ---
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
