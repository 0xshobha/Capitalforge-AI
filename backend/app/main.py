from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import analyze, health

settings = get_settings()

app = FastAPI(
    title="CapitalForge AI",
    description="Real-time AI startup due diligence — MVP",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    # Allow LAN IP access during local demo (e.g. http://192.168.x.x:3000)
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(analyze.router)


@app.get("/")
async def root():
    return {
        "name": "CapitalForge AI",
        "docs": "/docs",
        "health": "/health",
        "analyze": "POST /api/analyze",
    }
