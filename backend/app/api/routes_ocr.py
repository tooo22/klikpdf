from pathlib import Path
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import FileResponse
from app.core.storage import storage_manager
from app.services.ocr_service import ocr_service

router = APIRouter()

@router.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...), lang: str = Form("ind+eng")):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    out_pdf = session_dir / "ocr_klikpdf.pdf"
    ocr_service.perform_ocr_pdf(in_path, out_pdf, lang=lang)
    return FileResponse(out_pdf, filename="ocr_klikpdf.pdf", media_type="application/pdf")
