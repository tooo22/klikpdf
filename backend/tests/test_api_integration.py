import fitz
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "running"

def test_merge_endpoint_integration(tmp_path):
    p1 = tmp_path / "1.pdf"
    doc = fitz.open()
    doc.new_page().insert_text(fitz.Point(10, 10), "Page 1")
    doc.save(p1)
    doc.close()

    p2 = tmp_path / "2.pdf"
    doc2 = fitz.open()
    doc2.new_page().insert_text(fitz.Point(10, 10), "Page 2")
    doc2.save(p2)
    doc2.close()

    with open(p1, "rb") as f1, open(p2, "rb") as f2:
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
