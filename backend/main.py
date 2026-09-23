from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .seed import seed_database
from .routers import (
    auth,
    admins,
    events,
    stock,
    clients,
    quotations,
    money,
    profile,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all database tables
    Base.metadata.create_all(bind=engine)
    # Seed default ADMIN/ADMIN and initial database records
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="ROLEX Events & Caterers API",
    description="Operational Backend API with PostgreSQL persistence & Admin Auth",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8082",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://rolex-frontend.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(admins.router)
app.include_router(events.router)
app.include_router(stock.router)
app.include_router(clients.router)
app.include_router(quotations.router)
app.include_router(money.router)
app.include_router(profile.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "ROLEX Events & Caterers Backend"}
