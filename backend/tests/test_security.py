import io
import asyncio
from pathlib import Path
import pytest
from fastapi import HTTPException, UploadFile
from app.core.storage import storage_manager

def test_sanitize_filename_prevents_traversal():
    dangerous = "../../etc/passwd"
    clean = storage_manager.sanitize_filename(dangerous, allowed_exts=[".pdf"])
    assert ".." not in clean
    assert "/" not in clean
    assert "\\" not in clean
    assert clean == "passwd.pdf"

def test_sanitize_filename_allowed_extensions():
    clean = storage_manager.sanitize_filename("script.exe", allowed_exts=[".docx", ".pdf"])
    assert clean.endswith(".docx")

def test_save_upload_file_enforces_size_limit(tmp_path):
    async def run_test():
        fake_content = b"A" * 200
        file = UploadFile(filename="oversized.pdf", file=io.BytesIO(fake_content))
        dest = tmp_path / "test_out.pdf"
        
        with pytest.raises(HTTPException) as exc_info:
            await storage_manager.save_upload_file(file, dest, max_bytes=100)
        
        assert exc_info.value.status_code == 413
        assert not dest.exists()

    asyncio.run(run_test())
