import sys

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.seeds.seed_data import seed_database
from app.routers import auth, subjects, lessons, quizzes, progress, teacher, tutor

# Create tables and seed data on startup
Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API សម្រាប់ប្រព័ន្ធស្វ័យសិក្សាថ្នាក់បឋមសិក្សាកម្ពុជា Khmer Learning (ថ្នាក់ទី ១-៦)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(subjects.router, prefix=settings.API_V1_STR)
app.include_router(lessons.router, prefix=settings.API_V1_STR)
app.include_router(quizzes.router, prefix=settings.API_V1_STR)
app.include_router(progress.router, prefix=settings.API_V1_STR)
app.include_router(teacher.router, prefix=settings.API_V1_STR)
app.include_router(tutor.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": "Khmer Learning API",
        "description": "ប្រព័ន្ធសិក្សាថ្នាក់បឋមសិក្សាកម្ពុជា",
        "version": settings.VERSION,
        "status": "ដំណើរការធម្មតា (Online)",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "message": "សេវាកម្មដំណើរការល្អប្រសើរ (Service healthy)"
    }
