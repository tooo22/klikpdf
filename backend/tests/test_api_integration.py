import io
import fitz
from PIL import Image
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def sample_pdf(tmp_path):
    p = tmp_path / "sample.pdf"
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(fitz.Point(50, 50), "Sample Text for Testing SukaPDF")
    page.insert_text(fitz.Point(50, 80), "Header 1")
    page.insert_text(fitz.Point(50, 100), "Baris 1\tData 1")
    doc.save(p)
    doc.close()
    return p

@pytest.fixture
def sample_image(tmp_path):
    p = tmp_path / "sample.png"
    img = Image.new("RGB", (200, 200), color=(255, 0, 0))
    img.save(p, format="PNG")
    return p

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "running"

def test_merge_endpoint_integration(tmp_path, sample_pdf):
    with open(sample_pdf, "rb") as f1, open(sample_pdf, "rb") as f2:
        res = client.post(
            "/api/merge",
            files=[
                ("files", ("1.pdf", f1, "application/pdf")),
                ("files", ("2.pdf", f2, "application/pdf")),
            ],
        )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 0

def test_split_endpoint_integration(sample_pdf):
    with open(sample_pdf, "rb") as f:
        res = client.post(
            "/api/split",
            files={"file": ("sample.pdf", f, "application/pdf")},
            data={"ranges": "1"}
        )
    assert res.status_code == 200
    assert len(res.content) > 0

def test_compress_endpoint_integration(sample_pdf):
    with open(sample_pdf, "rb") as f:
        res = client.post(
            "/api/compress",
            files={"file": ("sample.pdf", f, "application/pdf")},
            data={"level": "medium"}
        )
    assert res.status_code == 200
    assert len(res.content) > 0

def test_rotate_endpoint_integration(sample_pdf):
    with open(sample_pdf, "rb") as f:
        res = client.post(
            "/api/rotate",
            files={"file": ("sample.pdf", f, "application/pdf")},
            data={"degrees": 90}
        )
    assert res.status_code == 200
    assert len(res.content) > 0

def test_watermark_endpoint_integration(sample_pdf):
    with open(sample_pdf, "rb") as f:
        res = client.post(
            "/api/watermark",
            files={"file": ("sample.pdf", f, "application/pdf")},
            data={"text": "KlikPDF Watermark"}
        )
    assert res.status_code == 200
    assert len(res.content) > 0

def test_page_numbers_endpoint_integration(sample_pdf):
    with open(sample_pdf, "rb") as f:
        res = client.post(
            "/api/page-numbers",
            files={"file": ("sample.pdf", f, "application/pdf")},
            data={"position": "bottom-right"}
        )
    assert res.status_code == 200
    assert len(res.content) > 0

def test_protect_and_unlock_endpoint_integration(sample_pdf):
    with open(sample_pdf, "rb") as f:
        res_protect = client.post(
            "/api/protect",
            files={"file": ("sample.pdf", f, "application/pdf")},
            data={"password": "secretpassword"}
        )
    assert res_protect.status_code == 200
    protected_content = res_protect.content

    res_unlock = client.post(
        "/api/unlock",
        files={"file": ("protected.pdf", protected_content, "application/pdf")},
        data={"password": "secretpassword"}
    )
    assert res_unlock.status_code == 200
    assert len(res_unlock.content) > 0

def test_pdf_to_word_endpoint_integration(sample_pdf):
    with open(sample_pdf, "rb") as f:
        res = client.post(
            "/api/pdf-to-word",
            files={"file": ("sample.pdf", f, "application/pdf")}
        )
    assert res.status_code == 200
    assert len(res.content) > 0

def test_pdf_to_excel_endpoint_integration(sample_pdf):
    with open(sample_pdf, "rb") as f:
        res = client.post(
            "/api/pdf-to-excel",
            files={"file": ("sample.pdf", f, "application/pdf")}
        )
    assert res.status_code == 200
    assert len(res.content) > 0

def test_image_endpoints_integration(sample_pdf, sample_image):
    with open(sample_pdf, "rb") as f:
        res_img = client.post(
            "/api/pdf-to-image",
            files={"file": ("sample.pdf", f, "application/pdf")},
            data={"format": "png"}
        )
    assert res_img.status_code == 200

    with open(sample_image, "rb") as f:
        res_pdf = client.post(
            "/api/image-to-pdf",
            files=[("files", ("test.png", f, "image/png"))]
        )
    assert res_pdf.status_code == 200

    with open(sample_image, "rb") as f:
        res_hd = client.post(
            "/api/enhance-image",
            files={"file": ("test.png", f, "image/png")},
            data={"scale": 2, "quality": "hd"}
        )
    assert res_hd.status_code == 200

def test_ocr_endpoint_integration(sample_pdf):
    with open(sample_pdf, "rb") as f:
        res = client.post(
            "/api/ocr",
            files={"file": ("sample.pdf", f, "application/pdf")},
            data={"lang": "ind+eng"}
        )
    assert res.status_code == 200
    assert len(res.content) > 0
