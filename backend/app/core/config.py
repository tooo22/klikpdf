import os
import tempfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
TEMP_STORAGE_DIR = Path(tempfile.gettempdir()) / "klikpdf_temp_storage"

class Settings:
    PROJECT_NAME: str = "KlikPDF API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    TEMP_DIR: Path = TEMP_STORAGE_DIR
    MAX_UPLOAD_SIZE_MB: int = 50
    CLEANUP_INTERVAL_MINUTES: int = 30
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://klikpdf.my.id",
        "https://www.klikpdf.my.id",
        "https://klikpdf-monorepo.vercel.app"
    ]

settings = Settings()
