import os
import logging
from sqlalchemy import create_engine
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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
