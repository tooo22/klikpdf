import zipfile
import fitz
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract

class OCRService:
    @staticmethod
    def pdf_to_images(pdf_path: Path, output_dir: Path, image_format: str = "png") -> list[Path]:
        doc = fitz.open(pdf_path)
        saved_paths = []
        for i, page in enumerate(doc):
            pix = page.get_pixmap(dpi=150)
            img_path = output_dir / f"page_{i + 1}.{image_format}"
            pix.save(str(img_path))
            saved_paths.append(img_path)
        doc.close()
        return saved_paths

    @staticmethod
    def images_to_pdf(image_paths: list[Path], output_pdf_path: Path) -> Path:
        doc = fitz.open()
        for img_path in image_paths:
            img_doc = fitz.open(img_path)
            pdf_bytes = img_doc.convert_to_pdf()
            img_doc.close()
            page_doc = fitz.open("pdf", pdf_bytes)
            doc.insert_pdf(page_doc)
            page_doc.close()
        doc.save(output_pdf_path)
        doc.close()
        return output_pdf_path

    @staticmethod
    def perform_ocr_pdf(pdf_path: Path, output_pdf_path: Path, lang: str = "ind+eng") -> Path:
        doc = fitz.open(pdf_path)
        ocr_pdf = fitz.open()
        
        for page in doc:
            pix = page.get_pixmap(dpi=150)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            try:
                ocr_pdf_bytes = pytesseract.image_to_pdf_or_hocr(img, extension="pdf", lang=lang)
                temp_ocr_doc = fitz.open("pdf", ocr_pdf_bytes)
                ocr_pdf.insert_pdf(temp_ocr_doc)
                temp_ocr_doc.close()
            except Exception:
                # Fallback if tesseract binary is absent on system or fails: retain existing page
                ocr_pdf.insert_pdf(doc, from_page=page.number, to_page=page.number)
                
        ocr_pdf.save(output_pdf_path)
        ocr_pdf.close()
        doc.close()
        return output_pdf_path

    @staticmethod
    def enhance_image(image_path: Path, output_path: Path, scale: int = 2, sharpness: float = 1.6, contrast: float = 1.1) -> Path:
        img = Image.open(image_path)
        if img.mode != "RGB":
            img = img.convert("RGB")
        
        # 1. Super-Resolution Upscaling with High-Quality Lanczos Resampling
        new_width = int(img.width * scale)
        new_height = int(img.height * scale)
        upscaled = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 2. Detail Restoration (sharpen at the kernel level)
        upscaled = upscaled.filter(ImageFilter.DETAIL)
        
        # 3. Unsharp Mask (tuned for punchier sharpness)
        percent = min(500, int(200 * sharpness))
        sharpened = upscaled.filter(ImageFilter.UnsharpMask(
            radius=3, percent=percent, threshold=1
        ))
        
        # 4. Fine-tuning sharpness (adjust contrast and color on the sharpened result)
        enhancer_sharp = ImageEnhance.Sharpness(sharpened)
        enhanced = enhancer_sharp.enhance(sharpness)
        
        enhancer_contrast = ImageEnhance.Contrast(enhanced)
        enhanced = enhancer_contrast.enhance(contrast)
        
        enhancer_color = ImageEnhance.Color(enhanced)
        enhanced = enhancer_color.enhance(1.08)
        
        enhanced.save(output_path, quality=95, optimize=True)
        return output_path

ocr_service = OCRService()
