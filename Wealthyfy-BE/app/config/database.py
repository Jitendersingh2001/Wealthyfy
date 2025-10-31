from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .setting import settings  # adjust path if needed

engine = create_engine(
    settings.db.DB_DATABASE_URL,
    echo=settings.app.APP_DEBUG,
    pool_pre_ping=True,
)

# --- Session Factory ---
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# --- Declarative Base for Models ---
Base = declarative_base()

# --- FastAPI Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
