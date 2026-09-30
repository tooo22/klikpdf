from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_core, routes_convert, routes_image, routes_ocr
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_core.router, prefix=settings.API_PREFIX, tags=["Core PDF"])
app.include_router(routes_convert.router, prefix=settings.API_PREFIX, tags=["Convert"])
app.include_router(routes_image.router, prefix=settings.API_PREFIX, tags=["Image"])
app.include_router(routes_ocr.router, prefix=settings.API_PREFIX, tags=["OCR"])

@app.get("/")
def root():
    return {"message": "Selamat datang di KlikPDF Backend API!", "status": "running"}
