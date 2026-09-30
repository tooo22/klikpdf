import shutil
import time
import uuid
from pathlib import Path
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
        path = self.base_temp_dir / session_id
        if path.exists() and path.is_dir():
            return path
        return None

    def cleanup_session_dir(self, session_id: str) -> bool:
        path = self.base_temp_dir / session_id
        if path.exists() and path.is_dir():
            shutil.rmtree(path, ignore_errors=True)
            return True
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

storage_manager = StorageManager()
