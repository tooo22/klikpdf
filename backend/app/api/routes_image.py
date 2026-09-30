import zipfile
from pathlib import Path
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from app.core.storage import storage_manager
from app.services.ocr_service import ocr_service

router = APIRouter()

@router.post("/pdf-to-image")
async def pdf_to_image_endpoint(file: UploadFile = File(...), format: str = Form("png")):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    img_files = ocr_service.pdf_to_images(in_path, session_dir, image_format=format)
    zip_path = session_dir / "images_klikpdf.zip"
    with zipfile.ZipFile(zip_path, "w") as z:
        for f in img_files:
            z.write(f, arcname=f.name)
    return FileResponse(zip_path, filename="images_klikpdf.zip", media_type="application/zip")

@router.post("/image-to-pdf")
async def image_to_pdf_endpoint(files: list[UploadFile] = File(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    saved_images = []
    for idx, f in enumerate(files):
        img_path = session_dir / f"img_{idx}_{f.filename}"
        img_path.write_bytes(await f.read())
        saved_images.append(img_path)
        
    out_pdf = session_dir / "converted_images_klikpdf.pdf"
    ocr_service.images_to_pdf(saved_images, out_pdf)
    return FileResponse(out_pdf, filename="converted_images_klikpdf.pdf", media_type="application/pdf")

@router.post("/enhance-image")
async def enhance_image_endpoint(
    file: UploadFile = File(...),
    scale: int = Form(2),
    quality: str = Form("hd")
):
    session_id, session_dir = storage_manager.create_session_dir()
    ext = Path(file.filename or "image.png").suffix or ".png"
    in_path = session_dir / f"input{ext}"
    in_path.write_bytes(await file.read())
    
    sharpness = 1.8 if quality == "ultra" else 1.4
    contrast = 1.15 if quality == "ultra" else 1.08
    scale_factor = 4 if quality == "ultra" else (scale or 2)
    
    out_path = session_dir / f"enhanced_hd_klikpdf{ext}"
    ocr_service.enhance_image(in_path, out_path, scale=scale_factor, sharpness=sharpness, contrast=contrast)
    
    media_type = "image/png" if ext.lower() == ".png" else "image/jpeg"
    return FileResponse(out_path, filename=f"enhanced_hd_klikpdf{ext}", media_type=media_type)
