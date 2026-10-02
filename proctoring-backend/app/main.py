from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routes import auth, exams, attempts, users


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Proctoring System API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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