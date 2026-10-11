import zipfile
from pathlib import Path
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from app.core.storage import storage_manager
from app.services.ocr_service import ocr_service
from app.services.pdf_service import pdf_service

router = APIRouter()

ALLOWED_IMG_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}

@router.post("/pdf-to-image")
async def pdf_to_image_endpoint(file: UploadFile = File(...), format: str = Form("png")):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        in_path = session_dir / "input.pdf"
        await storage_manager.save_upload_file(file, in_path)
        clean_name = storage_manager.sanitize_filename(file.filename)
        pdf_service.verify_safe(in_path, clean_name)
        
        safe_format = "png" if format.lower() == "png" else "jpeg"
        img_files = ocr_service.pdf_to_images(in_path, session_dir, image_format=safe_format)
        zip_path = session_dir / "images_klikpdf.zip"
        with zipfile.ZipFile(zip_path, "w") as z:
            for f in img_files:
                z.write(f, arcname=f.name)
        return FileResponse(
            zip_path,
            filename="images_klikpdf.zip",
            media_type="application/zip",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise

@router.post("/image-to-pdf")
async def image_to_pdf_endpoint(files: list[UploadFile] = File(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        saved_images = []
        for idx, f in enumerate(files):
            raw_ext = Path(f.filename or "").suffix.lower()
            safe_ext = raw_ext if raw_ext in ALLOWED_IMG_EXTS else ".png"
            # Safe server-controlled filename prevents any directory traversal
            img_path = session_dir / f"img_{idx}{safe_ext}"
            await storage_manager.save_upload_file(f, img_path)
            saved_images.append(img_path)
            
        out_pdf = session_dir / "converted_images_klikpdf.pdf"
        ocr_service.images_to_pdf(saved_images, out_pdf)
        return FileResponse(
            out_pdf,
            filename="converted_images_klikpdf.pdf",
            media_type="application/pdf",
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise

@router.post("/enhance-image")
async def enhance_image_endpoint(
    file: UploadFile = File(...),
    scale: int = Form(2),
    quality: str = Form("hd")
):
    session_id, session_dir = storage_manager.create_session_dir()
    try:
        raw_ext = Path(file.filename or "").suffix.lower()
        safe_ext = raw_ext if raw_ext in ALLOWED_IMG_EXTS else ".png"
        in_path = session_dir / f"input{safe_ext}"
        await storage_manager.save_upload_file(file, in_path)
        
        sharpness = 2.0 if quality == "ultra" else 1.5
        contrast = 1.2 if quality == "ultra" else 1.1
        scale_factor = 4 if quality == "ultra" else min(max(scale or 2, 1), 4)
        
        out_path = session_dir / f"enhanced_hd_klikpdf{safe_ext}"
        ocr_service.enhance_image(in_path, out_path, scale=scale_factor, sharpness=sharpness, contrast=contrast)
        
        media_type = "image/png" if safe_ext == ".png" else "image/jpeg"
        return FileResponse(
            out_path,
            filename=f"enhanced_hd_klikpdf{safe_ext}",
            media_type=media_type,
            background=BackgroundTask(storage_manager.cleanup_session_dir, session_id)
        )
    except Exception:
        storage_manager.cleanup_session_dir(session_id)
        raise
