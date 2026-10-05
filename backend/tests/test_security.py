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

def test_inspect_pdf_page_limit(tmp_path):
    import fitz
    from app.services.pdf_service import pdf_service
    pdf_path = tmp_path / "test_pages.pdf"
    doc = fitz.open()
    doc.new_page()
    doc.new_page()
    doc.save(pdf_path)
    doc.close()

    # Passing max_pages=1 should trigger limit exceeded
    valid, reason = pdf_service.inspect_pdf(pdf_path, max_pages=1)
    assert not valid
    assert reason.startswith("PAGE_LIMIT_EXCEEDED")

    # Passing max_pages=5 should pass
    valid, reason = pdf_service.inspect_pdf(pdf_path, max_pages=5)
    assert valid
    assert reason == "OK"

def test_inspect_pdf_detects_encrypted(tmp_path):
    import fitz
    from app.services.pdf_service import pdf_service
    from pypdf import PdfReader, PdfWriter
    
    plain_path = tmp_path / "plain.pdf"
    enc_path = tmp_path / "enc.pdf"
    doc = fitz.open()
    doc.new_page()
    doc.save(plain_path)
    doc.close()

    writer = PdfWriter()
    reader = PdfReader(plain_path)
    for page in reader.pages:
        writer.add_page(page)
    writer.encrypt("secret123")
    with open(enc_path, "wb") as f:
        writer.write(f)

    valid, reason = pdf_service.inspect_pdf(enc_path)
    assert not valid
    assert reason == "ENCRYPTED"

def test_docs_disabled_in_production():
    from app.main import app
    from app.core.config import settings
    if settings.ENVIRONMENT == "production" and not settings.DEBUG:
        assert app.docs_url is None
        assert app.redoc_url is None
        assert app.openapi_url is None
