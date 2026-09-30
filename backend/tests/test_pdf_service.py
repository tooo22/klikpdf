import fitz
import pytest
from pathlib import Path
from app.services.pdf_service import pdf_service

@pytest.fixture
def sample_pdf(tmp_path: Path) -> Path:
    pdf_path = tmp_path / "sample.pdf"
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(fitz.Point(50, 50), "Hello KlikPDF Test Page 1")
    page2 = doc.new_page()
    page2.insert_text(fitz.Point(50, 50), "Hello KlikPDF Test Page 2")
    doc.save(pdf_path)
    doc.close()
    return pdf_path

def test_pdf_merge_and_validate(tmp_path: Path, sample_pdf: Path):
    assert pdf_service.validate_pdf(sample_pdf) is True
    
    out_path = tmp_path / "merged.pdf"
    pdf_service.merge_pdfs([sample_pdf, sample_pdf], out_path)
    
    assert out_path.exists()
    merged_doc = fitz.open(out_path)
    assert len(merged_doc) == 4
    merged_doc.close()
