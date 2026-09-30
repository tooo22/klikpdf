import zipfile
import fitz
from pathlib import Path
from PIL import Image
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
                img_bytes = fitz.open()
                pdf_b = fitz.open("pdf", page.get_text("pdf") or fitz.open().new_page().get_text("pdf"))
                ocr_pdf.insert_pdf(doc, from_page=page.number, to_page=page.number)
                
        ocr_pdf.save(output_pdf_path)
        ocr_pdf.close()
        doc.close()
        return output_pdf_path

ocr_service = OCRService()
