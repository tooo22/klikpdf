import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_core, routes_convert, routes_image, routes_ocr
from app.core.config import settings
from app.core.storage import storage_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: purge any stale leftover temporary sessions
    storage_manager.cleanup_expired_sessions(max_age_seconds=1800)
    
    # 2. Background scheduler for continuous garbage collection
    async def periodic_cleanup():
        while True:
            try:
                await asyncio.sleep(settings.CLEANUP_INTERVAL_MINUTES * 60)
                storage_manager.cleanup_expired_sessions(max_age_seconds=1800)
            except asyncio.CancelledError:
                break
            except Exception:
                pass

    cleanup_task = asyncio.create_task(periodic_cleanup())
    yield
    cleanup_task.cancel()

is_docs_enabled = settings.DEBUG or settings.ENVIRONMENT in ("dev", "development", "local")
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs" if is_docs_enabled else None,
    redoc_url="/redoc" if is_docs_enabled else None,
    openapi_url="/openapi.json" if is_docs_enabled else None,
    lifespan=lifespan
)

# Resolve allowed CORS origins safely without wildcard credentials
cors_env = os.getenv("CORS_ORIGINS")
allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()] if cors_env else settings.CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
app.include_router(routes_core.router, prefix=settings.API_PREFIX, tags=["Core PDF"])
app.include_router(routes_convert.router, prefix=settings.API_PREFIX, tags=["Convert"])
app.include_router(routes_image.router, prefix=settings.API_PREFIX, tags=["Image"])
app.include_router(routes_ocr.router, prefix=settings.API_PREFIX, tags=["OCR"])

@app.get("/")
def root():
    return {"message": "Selamat datang di KlikPDF Backend API!", "status": "running"}
