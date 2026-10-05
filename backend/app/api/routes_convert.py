from pathlib import Path
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from app.core.storage import storage_manager
from app.services.convert_service import convert_service
from app.services.pdf_service import pdf_service

router = APIRouter()

@router.post("/pdf-to-word")
async def pdf_to_word_endpoint(file: UploadFile = File(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        in_path = session_dir / "input.pdf"
        await storage_manager.save_upload_file(file, in_path)
        
        if not pdf_service.validate_pdf(in_path):
            raise HTTPException(status_code=400, detail="Berkas bukan PDF yang valid.")
            
        out_path = session_dir / "converted_klikpdf.docx"
        convert_service.pdf_to_word(in_path, out_path)
        return FileResponse(
            out_path,
            filename="converted_klikpdf.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise

@router.post("/pdf-to-excel")
async def pdf_to_excel_endpoint(file: UploadFile = File(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        in_path = session_dir / "input.pdf"
        await storage_manager.save_upload_file(file, in_path)
        
        out_path = session_dir / "converted_klikpdf.xlsx"
        convert_service.pdf_to_excel(in_path, out_path)
        return FileResponse(
            out_path,
            filename="converted_klikpdf.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise

@router.post("/word-to-pdf")
async def word_to_pdf_endpoint(file: UploadFile = File(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        # Use fixed, safe server-controlled filename to eliminate path traversal
        in_path = session_dir / "input.docx"
        await storage_manager.save_upload_file(file, in_path)
        
        out_path = session_dir / "converted_klikpdf.pdf"
        convert_service.word_to_pdf(in_path, out_path)
        return FileResponse(
            out_path,
            filename="converted_klikpdf.pdf",
            media_type="application/pdf",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise
