import fitz
import pytest
from pathlib import Path
from app.services.ocr_service import ocr_service

def test_pdf_to_images_and_back(tmp_path: Path):
    pdf_path = tmp_path / "test.pdf"
    doc = fitz.open()
    p = doc.new_page()
    p.insert_text(fitz.Point(100, 100), "KlikPDF OCR Test")
    doc.save(pdf_path)
    doc.close()
    
    images = ocr_service.pdf_to_images(pdf_path, tmp_path, "png")
    assert len(images) == 1
    assert images[0].exists()
    
    out_pdf = tmp_path / "reconstructed.pdf"
    ocr_service.images_to_pdf(images, out_pdf)
    assert out_pdf.exists()
