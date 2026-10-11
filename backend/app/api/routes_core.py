import zipfile
from pathlib import Path
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.background import BackgroundTask
from app.core.storage import storage_manager
from app.services.pdf_service import pdf_service

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/merge")
@limiter.limit("10/minute")
async def merge_pdfs_endpoint(request: Request, files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Perlu minimal 2 file PDF untuk digabungkan.")
    
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        input_paths = []
        for idx, file in enumerate(files):
            in_path = session_dir / f"input_{idx}.pdf"
            await storage_manager.save_upload_file(file, in_path)
            clean_name = storage_manager.sanitize_filename(file.filename)
            pdf_service.verify_safe(in_path, clean_name)
            input_paths.append(in_path)
            
        out_path = session_dir / "merged_klikpdf.pdf"
        pdf_service.merge_pdfs(input_paths, out_path)
        return FileResponse(
            out_path,
            filename="merged_klikpdf.pdf",
            media_type="application/pdf",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise

@router.post("/split")
async def split_pdf_endpoint(file: UploadFile = File(...), ranges: str | None = Form(None)):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        in_path = session_dir / "input.pdf"
        await storage_manager.save_upload_file(file, in_path)
        clean_name = storage_manager.sanitize_filename(file.filename)
        pdf_service.verify_safe(in_path, clean_name)
        out_files = pdf_service.split_pdf(in_path, session_dir, ranges)
        if len(out_files) == 1:
            return FileResponse(
                out_files[0],
                filename="split_klikpdf.pdf",
                media_type="application/pdf",
                background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
            )
        
        zip_path = session_dir / "split_pages.zip"
        with zipfile.ZipFile(zip_path, "w") as z:
            for f in out_files:
                z.write(f, arcname=f.name)
        return FileResponse(
            zip_path,
            filename="split_pages.zip",
            media_type="application/zip",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise

@router.post("/compress")
async def compress_pdf_endpoint(file: UploadFile = File(...), level: str = Form("medium")):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        in_path = session_dir / "input.pdf"
        await storage_manager.save_upload_file(file, in_path)
        clean_name = storage_manager.sanitize_filename(file.filename)
        pdf_service.verify_safe(in_path, clean_name)
        out_path = session_dir / "compressed_klikpdf.pdf"
        pdf_service.compress_pdf(in_path, out_path, level)
        return FileResponse(
            out_path,
            filename="compressed_klikpdf.pdf",
            media_type="application/pdf",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise

@router.post("/rotate")
async def rotate_pdf_endpoint(file: UploadFile = File(...), degrees: int = Form(90)):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        in_path = session_dir / "input.pdf"
        await storage_manager.save_upload_file(file, in_path)
        clean_name = storage_manager.sanitize_filename(file.filename)
        pdf_service.verify_safe(in_path, clean_name)
        out_path = session_dir / "rotated_klikpdf.pdf"
        pdf_service.rotate_pdf(in_path, out_path, degrees)
        return FileResponse(
            out_path,
            filename="rotated_klikpdf.pdf",
            media_type="application/pdf",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise

@router.post("/watermark")
async def watermark_pdf_endpoint(file: UploadFile = File(...), text: str = Form("KlikPDF")):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        in_path = session_dir / "input.pdf"
        await storage_manager.save_upload_file(file, in_path)
        clean_name = storage_manager.sanitize_filename(file.filename)
        pdf_service.verify_safe(in_path, clean_name)
        out_path = session_dir / "watermarked_klikpdf.pdf"
        pdf_service.add_watermark(in_path, out_path, text)
        return FileResponse(
            out_path,
            filename="watermarked_klikpdf.pdf",
            media_type="application/pdf",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise

@router.post("/page-numbers")
async def page_numbers_endpoint(file: UploadFile = File(...), position: str = Form("bottom-right")):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        in_path = session_dir / "input.pdf"
        await storage_manager.save_upload_file(file, in_path)
        clean_name = storage_manager.sanitize_filename(file.filename)
        pdf_service.verify_safe(in_path, clean_name)
        out_path = session_dir / "numbered_klikpdf.pdf"
        pdf_service.add_page_numbers(in_path, out_path, position)
        return FileResponse(
            out_path,
            filename="numbered_klikpdf.pdf",
            media_type="application/pdf",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise

@router.post("/protect")
async def protect_pdf_endpoint(file: UploadFile = File(...), password: str = Form(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        in_path = session_dir / "input.pdf"
        await storage_manager.save_upload_file(file, in_path)
        clean_name = storage_manager.sanitize_filename(file.filename)
        pdf_service.verify_safe(in_path, clean_name)
        out_path = session_dir / "protected_klikpdf.pdf"
        pdf_service.protect_pdf(in_path, out_path, password)
        return FileResponse(
            out_path,
            filename="protected_klikpdf.pdf",
            media_type="application/pdf",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise

@router.post("/unlock")
async def unlock_pdf_endpoint(file: UploadFile = File(...), password: str = Form(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        in_path = session_dir / "input.pdf"
        await storage_manager.save_upload_file(file, in_path)
        with open(in_path, "rb") as f_check:
            if f_check.read(5) != b"%PDF-":
                raise HTTPException(status_code=400, detail="Berkas bukan PDF yang valid.")
        out_path = session_dir / "unlocked_klikpdf.pdf"
        try:
            pdf_service.unlock_pdf(in_path, out_path, password)
        except Exception:
            raise HTTPException(status_code=400, detail="Kata sandi tidak cocok atau berkas tidak dapat dibuka.")
        return FileResponse(
            out_path,
            filename="unlocked_klikpdf.pdf",
            media_type="application/pdf",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise
