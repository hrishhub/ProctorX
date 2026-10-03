import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routes import auth, exams, attempts, users


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)

allow_origins = [
    origin.strip()
    for origin in cors_origins.split(",")
    if origin.strip()
]


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Proctoring System API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOADS_DIR),
    name="uploads",
)


app.include_router(auth.router)
app.include_router(exams.router)
app.include_router(attempts.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {
        "message": "Proctoring System API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


@app.get("/debug/cors")
def debug_cors():
    return {
        "cors_origins": os.getenv("CORS_ORIGINS"),
        "environment": os.getenv("ENVIRONMENT"),
    }