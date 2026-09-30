from pathlib import Path
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from app.core.storage import storage_manager
from app.services.convert_service import convert_service
from app.services.pdf_service import pdf_service

router = APIRouter()

@router.post("/pdf-to-word")
async def pdf_to_word_endpoint(file: UploadFile = File(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    if not pdf_service.validate_pdf(in_path):
        storage_manager.cleanup_session_dir(session_id)
        raise HTTPException(status_code=400, detail="Berkas bukan PDF yang valid.")
        
    out_path = session_dir / "converted_klikpdf.docx"
    convert_service.pdf_to_word(in_path, out_path)
    return FileResponse(out_path, filename="converted_klikpdf.docx", media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")

@router.post("/pdf-to-excel")
async def pdf_to_excel_endpoint(file: UploadFile = File(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    out_path = session_dir / "converted_klikpdf.xlsx"
    convert_service.pdf_to_excel(in_path, out_path)
    return FileResponse(out_path, filename="converted_klikpdf.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
