import os
import re
import shutil
import time
import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile
from app.core.config import settings

class StorageManager:
    def __init__(self, base_temp_dir: Path = settings.TEMP_DIR):
        self.base_temp_dir = base_temp_dir
        self.base_temp_dir.mkdir(parents=True, exist_ok=True)

    def create_session_dir(self) -> tuple[str, Path]:
        session_id = str(uuid.uuid4())
        session_path = self.base_temp_dir / session_id
        session_path.mkdir(parents=True, exist_ok=True)
        return session_id, session_path

    def get_session_dir(self, session_id: str) -> Path | None:
        clean_id = Path(str(session_id).replace("\x00", "")).name
        path = self.base_temp_dir / clean_id
        if path.exists() and path.is_dir():
            return path
        return None

    def cleanup_session_dir(self, session_id: str) -> bool:
        try:
            clean_id = Path(str(session_id).replace("\x00", "")).name
            path = self.base_temp_dir / clean_id
            if path.exists() and path.is_dir():
                shutil.rmtree(path, ignore_errors=True)
                return True
        except Exception:
            pass
        return False

    def cleanup_expired_sessions(self, max_age_seconds: int = 1800):
        now = time.time()
        if not self.base_temp_dir.exists():
            return
        for child in self.base_temp_dir.iterdir():
            if child.is_dir():
                try:
                    mtime = child.stat().st_mtime
                    if now - mtime > max_age_seconds:
                        shutil.rmtree(child, ignore_errors=True)
                except Exception:
                    pass

    async def save_upload_file(
        self,
        file: UploadFile,
        dest_path: Path,
        max_bytes: int = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    ) -> int:
        """
        Safely writes uploaded file in chunks with strict size limits
        to prevent OOM memory attacks and disk exhaustion.
        """
        chunk_size = 1024 * 1024  # 1MB
        total_bytes = 0
        try:
            with open(dest_path, "wb") as f_out:
                while True:
                    chunk = await file.read(chunk_size)
                    if not chunk:
                        break
                    total_bytes += len(chunk)
                    if total_bytes > max_bytes:
                        raise HTTPException(
                            status_code=413,
                            detail=f"Ukuran berkas melebihi batas maksimum {settings.MAX_UPLOAD_SIZE_MB}MB."
                        )
                    f_out.write(chunk)
        except Exception:
            if dest_path.exists():
                try:
                    dest_path.unlink(missing_ok=True)
                except Exception:
                    pass
            raise
        return total_bytes

    @staticmethod
    def sanitize_filename(
        filename: str | None,
        default_name: str = "document",
        allowed_exts: list[str] | None = None
    ) -> str:
        """
        Sanitizes user-provided filename to prevent path traversal and arbitrary writes.
        """
        if not filename:
            return f"{default_name}.pdf"
        clean = Path(filename.replace("\x00", "").strip()).name
        clean = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', clean)
        if not clean or clean in ('.', '..'):
            clean = default_name
        if allowed_exts:
            ext = Path(clean).suffix.lower()
            valid_exts = [e.lower() for e in allowed_exts]
            if ext not in valid_exts:
                clean = f"{Path(clean).stem}{valid_exts[0]}"
        return clean

storage_manager = StorageManager()
