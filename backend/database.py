import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("uvicorn")

# Retrieve database URL from environment or default to local Postgres
POSTGRES_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/rolex_db"
)
SQLITE_FALLBACK_URL = "sqlite:///./rolex.db"

# Try connecting to PostgreSQL first, fallback to SQLite if unavailable
engine = None
try:
    if "postgresql" in POSTGRES_URL:
        # Quick connect check with short timeout
        test_engine = create_engine(
            POSTGRES_URL,
            connect_args={"connect_timeout": 3} if "postgresql" in POSTGRES_URL else {},
            pool_pre_ping=True,
        )
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        logger.info(f"Connected to PostgreSQL database: {POSTGRES_URL}")
    else:
        engine = create_engine(
            POSTGRES_URL,
            connect_args={"check_same_thread": False} if "sqlite" in POSTGRES_URL else {},
        )
except Exception as e:
    logger.warning(
        f"Could not connect to PostgreSQL ({e}). "
        f"Falling back to high-performance local SQLite database at {SQLITE_FALLBACK_URL}."
    )
    engine = create_engine(
        SQLITE_FALLBACK_URL,
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def migrate_database(eng):
    """Safely apply schema migrations for new columns in SQLite / PostgreSQL."""
    columns_to_add = [
        ("catering_events", "quotation_id", "VARCHAR(50)"),
        ("catering_events", "package_tier", "VARCHAR(50)"),
        ("catering_events", "menu_courses_json", "TEXT"),
        ("catering_events", "stock_allocations_json", "TEXT"),
        ("quotations", "event_id", "VARCHAR(50)"),
        ("quotations", "sections_json", "TEXT"),
        ("quotations", "venue", "VARCHAR(200)"),
        ("quotations", "event_date", "VARCHAR(50)"),
        ("quotations", "event_timing", "VARCHAR(50)"),
        ("quotations", "guest_count", "INTEGER"),
        ("quotations", "service_type", "VARCHAR(100)"),
    ]
    with eng.connect() as conn:
        for table, col, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                conn.commit()
                logger.info(f"Database migration: Added column {col} to {table}")
            except Exception:
                # Column already exists or table not yet created
                pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

