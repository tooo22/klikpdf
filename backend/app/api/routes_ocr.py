import re
from pathlib import Path
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from app.core.storage import storage_manager
from app.services.ocr_service import ocr_service
from app.services.pdf_service import pdf_service

router = APIRouter()

@router.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...), lang: str = Form("ind+eng")):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        in_path = session_dir / "input.pdf"
        await storage_manager.save_upload_file(file, in_path)
        
        if not pdf_service.validate_pdf(in_path):
            raise HTTPException(status_code=400, detail="Berkas bukan PDF yang valid.")
            
        # Strictly sanitize lang parameter: only alphanumeric and '+' allowed
        safe_lang = re.sub(r'[^a-zA-Z0-9\+]', '', lang).strip() or "ind+eng"
        
        out_pdf = session_dir / "ocr_klikpdf.pdf"
        ocr_service.perform_ocr_pdf(in_path, out_pdf, lang=safe_lang)
        return FileResponse(
            out_pdf,
            filename="ocr_klikpdf.pdf",
            media_type="application/pdf",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise
