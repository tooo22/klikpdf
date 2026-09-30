# SukaPDF (iLovePDF Replika) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build SukaPDF, a full-featured iLovePDF clone with an identical visual UI (red `#E5322D` theme, dropzone, thumbnail preview, tool cards), bilingual ID/EN support, and complete PDF processing & conversion backend REST API powered by FastAPI and PyMuPDF.

**Architecture:** Decoupled FastAPI backend (Python 3.12, Uvicorn, PyMuPDF, pdf2docx, openpyxl, pytesseract) running on port 8000 and Vite + React + Tailwind CSS frontend running on port 5173. Frontend communicates with backend via Axios multipart form data. Temporary file storage is automatically managed with UUID isolation and background cleanup.

**Tech Stack:** 
- Backend: Python 3.12, FastAPI, Uvicorn, PyMuPDF (`fitz`), `pypdf`, `pdf2docx`, `python-docx`, `openpyxl`, `pdfplumber`, `Pillow`, `pytesseract`, `pytest`, `httpx`
- Frontend: React 18, Vite, Tailwind CSS, Lucide React icons, `pdfjs-dist`, Axios

## Global Constraints

- Primary Red Accent: `#E5322D` (Hover: `#C62828`)
- Backend Port: `8000` (`http://localhost:8000`)
- Frontend Port: `5173` (`http://localhost:5173`)
- Storage Path: `backend/temp_storage/`
- Default Language: Bahasa Indonesia (`id`), Toggle: English (`en`)
- Magic Bytes PDF Validation: `%PDF-`

---

### Task 1: Backend Scaffolding, Core Config, and Temporary Storage Manager

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/__init__.py`
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/storage.py`
- Test: `backend/tests/test_storage.py`

**Interfaces:**
- Consumes: Standard Python `os`, `pathlib`, `uuid`, `shutil`, `tempfile`
- Produces: `settings` object in `config.py`, `StorageManager` class in `storage.py` with `create_session_dir()`, `get_session_dir()`, and `cleanup_session_dir()`

- [ ] **Step 1: Write backend requirements and configuration**

Create `backend/requirements.txt`:
```text
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pymupdf>=1.23.0
pypdf>=4.0.0
pdf2docx>=0.5.6
python-docx>=1.1.0
openpyxl>=3.1.2
pdfplumber>=0.10.3
pillow>=10.2.0
pytesseract>=0.3.10
python-multipart>=0.0.9
httpx>=0.27.0
pytest>=8.0.0
```

Create `backend/app/core/config.py`:
```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
TEMP_STORAGE_DIR = BASE_DIR / "temp_storage"

class Settings:
    PROJECT_NAME: str = "SukaPDF API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    TEMP_DIR: Path = TEMP_STORAGE_DIR
    MAX_UPLOAD_SIZE_MB: int = 50
    CLEANUP_INTERVAL_MINUTES: int = 30
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "*"]

settings = Settings()
```

- [ ] **Step 2: Implement StorageManager with UUID isolation and cleanup**

Create `backend/app/core/storage.py`:
```python
import shutil
import time
import uuid
from pathlib import Path
from app.core.config import settings

class StorageManager:
    def __init__(self, base_temp_dir: Path = settings.TEMP_DIR):
        self.base_temp_dir = base_temp_dir
        self.base_temp_dir.mkdir(parents=True, exist_ok=True)

    def create_session_dir(self) -> tuple[str, Path]:
        session_id = str(uuid.uuid4())
        session_path = self.base_temp_dir / session_id
        session_path.mkdir(parents=True, exist_ok=True)
        return session_id, session_path

    def get_session_dir(self, session_id: str) -> Path | None:
        path = self.base_temp_dir / session_id
        if path.exists() and path.is_dir():
            return path
        return None

    def cleanup_session_dir(self, session_id: str) -> bool:
        path = self.base_temp_dir / session_id
        if path.exists() and path.is_dir():
            shutil.rmtree(path, ignore_errors=True)
            return True
        return False

    def cleanup_expired_sessions(self, max_age_seconds: int = 1800):
        now = time.time()
        if not self.base_temp_dir.exists():
            return
        for child in self.base_temp_dir.iterdir():
            if child.is_dir():
                try:
                    mtime = child.stat().st_mtime
                    if now - mtime > max_age_seconds:
                        shutil.rmtree(child, ignore_errors=True)
                except Exception:
                    pass

storage_manager = StorageManager()
```

- [ ] **Step 3: Write test for StorageManager**

Create `backend/tests/test_storage.py`:
```python
import pytest
from pathlib import Path
from app.core.storage import StorageManager

def test_storage_manager_lifecycle(tmp_path: Path):
    sm = StorageManager(base_temp_dir=tmp_path)
    session_id, session_path = sm.create_session_dir()
    
    assert session_path.exists()
    assert session_path.is_dir()
    assert sm.get_session_dir(session_id) == session_path
    
    test_file = session_path / "test.txt"
    test_file.write_text("hello world")
    assert test_file.exists()
    
    cleaned = sm.cleanup_session_dir(session_id)
    assert cleaned is True
    assert not session_path.exists()
```

- [ ] **Step 4: Run test to verify passes**

Run: `pytest backend/tests/test_storage.py -v`  
Expected: PASS

- [ ] **Step 5: Commit Task 1**

```bash
git add backend/
git commit -m "feat(backend): add core config and temporary storage manager"
```

---

### Task 2: Core PDF Service & Core Routes (Merge, Split, Compress, Rotate, Watermark, Page Numbers, Protect, Unlock)

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/pdf_service.py`
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/routes_core.py`
- Test: `backend/tests/test_pdf_service.py`

**Interfaces:**
- Consumes: PyMuPDF (`fitz`), `pypdf`, `StorageManager`
- Produces: `PDFService` functions: `merge_pdfs()`, `split_pdf()`, `compress_pdf()`, `rotate_pdf()`, `add_watermark()`, `add_page_numbers()`, `protect_pdf()`, `unlock_pdf()`. FastApi endpoints in `routes_core.py`.

- [ ] **Step 1: Implement PDFService**

Create `backend/app/services/pdf_service.py`:
```python
import fitz  # PyMuPDF
from pathlib import Path
from pypdf import PdfReader, PdfWriter

class PDFService:
    @staticmethod
    def validate_pdf(file_path: Path) -> bool:
        try:
            with open(file_path, "rb") as f:
                header = f.read(5)
                return header == b"%PDF-"
        except Exception:
            return False

    @staticmethod
    def merge_pdfs(pdf_paths: list[Path], output_path: Path) -> Path:
        merged_doc = fitz.open()
        for pdf_path in pdf_paths:
            doc = fitz.open(pdf_path)
            merged_doc.insert_pdf(doc)
            doc.close()
        merged_doc.save(output_path)
        merged_doc.close()
        return output_path

    @staticmethod
    def split_pdf(pdf_path: Path, output_dir: Path, ranges_str: str | None = None) -> list[Path]:
        doc = fitz.open(pdf_path)
        output_files = []
        total_pages = len(doc)
        
        if not ranges_str:
            # Extract each page into a separate PDF
            for page_num in range(total_pages):
                new_doc = fitz.open()
                new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
                out_file = output_dir / f"page_{page_num + 1}.pdf"
                new_doc.save(out_file)
                new_doc.close()
                output_files.append(out_file)
        else:
            # Parse page ranges e.g. "1-2, 4"
            pages_to_extract = set()
            parts = [p.strip() for p in ranges_str.split(",") if p.strip()]
            for part in parts:
                if "-" in part:
                    start, end = part.split("-", 1)
                    s, e = int(start) - 1, int(end) - 1
                    for p in range(max(0, s), min(total_pages, e + 1)):
                        pages_to_extract.add(p)
                else:
                    p = int(part) - 1
                    if 0 <= p < total_pages:
                        pages_to_extract.add(p)
            
            new_doc = fitz.open()
            for p in sorted(pages_to_extract):
                new_doc.insert_pdf(doc, from_page=p, to_page=p)
            out_file = output_dir / "split_output.pdf"
            new_doc.save(out_file)
            new_doc.close()
            output_files.append(out_file)

        doc.close()
        return output_files

    @staticmethod
    def compress_pdf(pdf_path: Path, output_path: Path, level: str = "medium") -> Path:
        doc = fitz.open(pdf_path)
        deflate = True
        garbage = 4 if level == "high" else 3
        doc.save(output_path, deflate=deflate, garbage=garbage)
        doc.close()
        return output_path

    @staticmethod
    def rotate_pdf(pdf_path: Path, output_path: Path, degrees: int = 90) -> Path:
        doc = fitz.open(pdf_path)
        for page in doc:
            page.set_rotation((page.rotation + degrees) % 360)
        doc.save(output_path)
        doc.close()
        return output_path

    @staticmethod
    def add_watermark(pdf_path: Path, output_path: Path, text: str = "SukaPDF", opacity: float = 0.3) -> Path:
        doc = fitz.open(pdf_path)
        for page in doc:
            rect = page.rect
            point = fitz.Point(rect.width / 4, rect.height / 2)
            page.insert_text(point, text, fontsize=40, color=(0.8, 0, 0), fill_opacity=opacity, rotate=45)
        doc.save(output_path)
        doc.close()
        return output_path

    @staticmethod
    def add_page_numbers(pdf_path: Path, output_path: Path, position: str = "bottom-right") -> Path:
        doc = fitz.open(pdf_path)
        total = len(doc)
        for i, page in enumerate(doc):
            rect = page.rect
            num_str = f"Halaman {i + 1} dari {total}"
            if "bottom" in position:
                y = rect.height - 30
            else:
                y = 30
            if "right" in position:
                x = rect.width - 120
            elif "center" in position:
                x = rect.width / 2 - 40
            else:
                x = 30
            page.insert_text(fitz.Point(x, y), num_str, fontsize=10, color=(0.2, 0.2, 0.2))
        doc.save(output_path)
        doc.close()
        return output_path

    @staticmethod
    def protect_pdf(pdf_path: Path, output_path: Path, password: str) -> Path:
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        writer.encrypt(password)
        with open(output_path, "wb") as f:
            writer.write(f)
        return output_path

    @staticmethod
    def unlock_pdf(pdf_path: Path, output_path: Path, password: str) -> Path:
        reader = PdfReader(pdf_path)
        if reader.is_encrypted:
            reader.decrypt(password)
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        with open(output_path, "wb") as f:
            writer.write(f)
        return output_path

pdf_service = PDFService()
```

- [ ] **Step 2: Implement FastAPI core routes (`routes_core.py`)**

Create `backend/app/api/routes_core.py`:
```python
import zipfile
from pathlib import Path
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from app.core.storage import storage_manager
from app.services.pdf_service import pdf_service

router = APIRouter()

@router.post("/merge")
async def merge_pdfs_endpoint(files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Perlu minimal 2 file PDF untuk digabungkan.")
    
    session_id, session_dir = storage_manager.create_session_dir()
    input_paths = []
    
    for idx, file in enumerate(files):
        in_path = session_dir / f"input_{idx}.pdf"
        content = await file.read()
        in_path.write_bytes(content)
        if not pdf_service.validate_pdf(in_path):
            storage_manager.cleanup_session_dir(session_id)
            raise HTTPException(status_code=400, detail=f"File {file.filename} bukan berkas PDF yang valid.")
        input_paths.append(in_path)
        
    out_path = session_dir / "merged_sukapdf.pdf"
    pdf_service.merge_pdfs(input_paths, out_path)
    return FileResponse(out_path, filename="merged_sukapdf.pdf", media_type="application/pdf")

@router.post("/split")
async def split_pdf_endpoint(file: UploadFile = File(...), ranges: str | None = Form(None)):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    if not pdf_service.validate_pdf(in_path):
        storage_manager.cleanup_session_dir(session_id)
        raise HTTPException(status_code=400, detail="Berkas bukan PDF yang valid.")
        
    out_files = pdf_service.split_pdf(in_path, session_dir, ranges)
    if len(out_files) == 1:
        return FileResponse(out_files[0], filename="split_sukapdf.pdf", media_type="application/pdf")
    
    zip_path = session_dir / "split_pages.zip"
    with zipfile.ZipFile(zip_path, "w") as z:
        for f in out_files:
            z.write(f, arcname=f.name)
    return FileResponse(zip_path, filename="split_pages.zip", media_type="application/zip")

@router.post("/compress")
async def compress_pdf_endpoint(file: UploadFile = File(...), level: str = Form("medium")):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    out_path = session_dir / "compressed_sukapdf.pdf"
    pdf_service.compress_pdf(in_path, out_path, level)
    return FileResponse(out_path, filename="compressed_sukapdf.pdf", media_type="application/pdf")

@router.post("/rotate")
async def rotate_pdf_endpoint(file: UploadFile = File(...), degrees: int = Form(90)):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    out_path = session_dir / "rotated_sukapdf.pdf"
    pdf_service.rotate_pdf(in_path, out_path, degrees)
    return FileResponse(out_path, filename="rotated_sukapdf.pdf", media_type="application/pdf")

@router.post("/watermark")
async def watermark_pdf_endpoint(file: UploadFile = File(...), text: str = Form("SukaPDF")):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    out_path = session_dir / "watermarked_sukapdf.pdf"
    pdf_service.add_watermark(in_path, out_path, text)
    return FileResponse(out_path, filename="watermarked_sukapdf.pdf", media_type="application/pdf")

@router.post("/page-numbers")
async def page_numbers_endpoint(file: UploadFile = File(...), position: str = Form("bottom-right")):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    out_path = session_dir / "numbered_sukapdf.pdf"
    pdf_service.add_page_numbers(in_path, out_path, position)
    return FileResponse(out_path, filename="numbered_sukapdf.pdf", media_type="application/pdf")

@router.post("/protect")
async def protect_pdf_endpoint(file: UploadFile = File(...), password: str = Form(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    out_path = session_dir / "protected_sukapdf.pdf"
    pdf_service.protect_pdf(in_path, out_path, password)
    return FileResponse(out_path, filename="protected_sukapdf.pdf", media_type="application/pdf")

@router.post("/unlock")
async def unlock_pdf_endpoint(file: UploadFile = File(...), password: str = Form(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    out_path = session_dir / "unlocked_sukapdf.pdf"
    try:
        pdf_service.unlock_pdf(in_path, out_path, password)
    except Exception:
        raise HTTPException(status_code=400, detail="Kata sandi tidak cocok atau berkas tidak dapat dibuka.")
    return FileResponse(out_path, filename="unlocked_sukapdf.pdf", media_type="application/pdf")
```

- [ ] **Step 3: Write tests for PDFService**

Create `backend/tests/test_pdf_service.py`:
```python
import fitz
import pytest
from pathlib import Path
from app.services.pdf_service import pdf_service

@pytest.fixture
def sample_pdf(tmp_path: Path) -> Path:
    pdf_path = tmp_path / "sample.pdf"
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(fitz.Point(50, 50), "Hello SukaPDF Test Page 1")
    page2 = doc.new_page()
    page2.insert_text(fitz.Point(50, 50), "Hello SukaPDF Test Page 2")
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
```

- [ ] **Step 4: Run pytest for pdf service**

Run: `pytest backend/tests/test_pdf_service.py -v`  
Expected: PASS

- [ ] **Step 5: Commit Task 2**

```bash
git add backend/
git commit -m "feat(backend): add PDFService and core PDF REST API routes"
```

---

### Task 3: Document Conversion, Image & OCR Services and Routes

**Files:**
- Create: `backend/app/services/convert_service.py`
- Create: `backend/app/services/ocr_service.py`
- Create: `backend/app/api/routes_convert.py`
- Create: `backend/app/api/routes_image.py`
- Create: `backend/app/api/routes_ocr.py`
- Test: `backend/tests/test_convert_service.py`

**Interfaces:**
- Consumes: `pdf2docx`, `docx`, `openpyxl`, `pdfplumber`, `Pillow`, `pytesseract`, `fitz`
- Produces: `ConvertService` & `OCRService` classes, REST endpoints for `/api/pdf-to-word`, `/api/word-to-pdf`, `/api/pdf-to-excel`, `/api/excel-to-pdf`, `/api/pdf-to-image`, `/api/image-to-pdf`, `/api/ocr`

- [ ] **Step 1: Implement ConvertService and OCRService**

Create `backend/app/services/convert_service.py`:
```python
import fitz
from pathlib import Path
from pdf2docx import Converter
import openpyxl
import pdfplumber

class ConvertService:
    @staticmethod
    def pdf_to_word(pdf_path: Path, docx_output_path: Path) -> Path:
        cv = Converter(str(pdf_path))
        cv.convert(str(docx_output_path), start=0, end=None)
        cv.close()
        return docx_output_path

    @staticmethod
    def pdf_to_excel(pdf_path: Path, xlsx_output_path: Path) -> Path:
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "SukaPDF Data"
        
        row_idx = 1
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                if tables:
                    for table in tables:
                        for row in table:
                            for col_idx, val in enumerate(row, start=1):
                                ws.cell(row=row_idx, column=col_idx, value=val or "")
                            row_idx += 1
                        row_idx += 1
                else:
                    # Fallback text extract
                    text = page.extract_text() or ""
                    for line in text.split("\n"):
                        ws.cell(row=row_idx, column=1, value=line)
                        row_idx += 1
        wb.save(xlsx_output_path)
        return xlsx_output_path

convert_service = ConvertService()
```

Create `backend/app/services/ocr_service.py`:
```python
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
                # Fallback if tesseract binary is absent on system
                img_bytes = fitz.open()
                pdf_b = fitz.open("pdf", page.get_text("pdf") or fitz.open().new_page().get_text("pdf"))
                ocr_pdf.insert_pdf(doc, from_page=page.number, to_page=page.number)
                
        ocr_pdf.save(output_pdf_path)
        ocr_pdf.close()
        doc.close()
        return output_pdf_path

ocr_service = OCRService()
```

- [ ] **Step 2: Implement Conversion, Image, and OCR API Routes**

Create `backend/app/api/routes_convert.py`:
```python
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
        
    out_path = session_dir / "converted_sukapdf.docx"
    convert_service.pdf_to_word(in_path, out_path)
    return FileResponse(out_path, filename="converted_sukapdf.docx", media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")

@router.post("/pdf-to-excel")
async def pdf_to_excel_endpoint(file: UploadFile = File(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    out_path = session_dir / "converted_sukapdf.xlsx"
    convert_service.pdf_to_excel(in_path, out_path)
    return FileResponse(out_path, filename="converted_sukapdf.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
```

Create `backend/app/api/routes_image.py`:
```python
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
    zip_path = session_dir / "images_sukapdf.zip"
    with zipfile.ZipFile(zip_path, "w") as z:
        for f in img_files:
            z.write(f, arcname=f.name)
    return FileResponse(zip_path, filename="images_sukapdf.zip", media_type="application/zip")

@router.post("/image-to-pdf")
async def image_to_pdf_endpoint(files: list[UploadFile] = File(...)):
    session_id, session_dir = storage_manager.create_session_dir()
    saved_images = []
    for idx, f in enumerate(files):
        img_path = session_dir / f"img_{idx}_{f.filename}"
        img_path.write_bytes(await f.read())
        saved_images.append(img_path)
        
    out_pdf = session_dir / "converted_images_sukapdf.pdf"
    ocr_service.images_to_pdf(saved_images, out_pdf)
    return FileResponse(out_pdf, filename="converted_images_sukapdf.pdf", media_type="application/pdf")
```

Create `backend/app/api/routes_ocr.py`:
```python
from pathlib import Path
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import FileResponse
from app.core.storage import storage_manager
from app.services.ocr_service import ocr_service

router = APIRouter()

@router.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...), lang: str = Form("ind+eng")):
    session_id, session_dir = storage_manager.create_session_dir()
    in_path = session_dir / "input.pdf"
    in_path.write_bytes(await file.read())
    
    out_pdf = session_dir / "ocr_sukapdf.pdf"
    ocr_service.perform_ocr_pdf(in_path, out_pdf, lang=lang)
    return FileResponse(out_pdf, filename="ocr_sukapdf.pdf", media_type="application/pdf")
```

- [ ] **Step 3: Write tests for image/conversion services**

Create `backend/tests/test_convert_service.py`:
```python
import fitz
import pytest
from pathlib import Path
from app.services.ocr_service import ocr_service

def test_pdf_to_images_and_back(tmp_path: Path):
    # Create test PDF
    pdf_path = tmp_path / "test.pdf"
    doc = fitz.open()
    p = doc.new_page()
    p.insert_text(fitz.Point(100, 100), "SukaPDF OCR Test")
    doc.save(pdf_path)
    doc.close()
    
    images = ocr_service.pdf_to_images(pdf_path, tmp_path, "png")
    assert len(images) == 1
    assert images[0].exists()
    
    out_pdf = tmp_path / "reconstructed.pdf"
    ocr_service.images_to_pdf(images, out_pdf)
    assert out_pdf.exists()
```

- [ ] **Step 4: Run pytest**

Run: `pytest backend/tests/test_convert_service.py -v`  
Expected: PASS

- [ ] **Step 5: Commit Task 3**

```bash
git add backend/
git commit -m "feat(backend): add document conversion, image extraction, and OCR services/routes"
```

---

### Task 4: Backend FastAPI App Assembly & Integration Server Setup

**Files:**
- Create: `backend/app/main.py`
- Create: `backend/run.py`
- Test: `backend/tests/test_api_integration.py`

**Interfaces:**
- Consumes: All routes in `app/api/`, CORS middleware, `uvicorn`
- Produces: Executable FastAPI application on `http://localhost:8000`

- [ ] **Step 1: Create `backend/app/main.py`**

Create `backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_core, routes_convert, routes_image, routes_ocr
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_core.router, prefix=settings.API_PREFIX, tags=["Core PDF"])
app.include_router(routes_convert.router, prefix=settings.API_PREFIX, tags=["Convert"])
app.include_router(routes_image.router, prefix=settings.API_PREFIX, tags=["Image"])
app.include_router(routes_ocr.router, prefix=settings.API_PREFIX, tags=["OCR"])

@app.get("/")
def root():
    return {"message": "Selamat datang di SukaPDF Backend API!", "status": "running"}
```

- [ ] **Step 2: Create `backend/run.py`**

Create `backend/run.py`:
```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
```

- [ ] **Step 3: Write integration test using HTTPX AsyncClient**

Create `backend/tests/test_api_integration.py`:
```python
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
    # Generate 2 PDFs
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
```

- [ ] **Step 4: Run full backend test suite**

Run: `pytest backend/tests/ -v`  
Expected: All tests PASS

- [ ] **Step 5: Commit Task 4**

```bash
git add backend/
git commit -m "feat(backend): complete FastAPI main entrypoint and integration tests"
```

---

### Task 5: Frontend Vite Scaffolding, Tailwind CSS Setup, and i18n Locales

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/index.css`
- Create: `frontend/src/locales/id.json`
- Create: `frontend/src/locales/en.json`
- Create: `frontend/src/context/LanguageContext.jsx`

**Interfaces:**
- Consumes: React 18, Vite, Tailwind CSS, lucide-react, pdfjs-dist
- Produces: React app foundation with red theme `#E5322D`, `LanguageContext` hook `useLanguage()` providing `t(key)` function

- [ ] **Step 1: Initialize `frontend/package.json`**

Create `frontend/package.json`:
```json
{
  "name": "sukapdf-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.8",
    "lucide-react": "^0.359.0",
    "pdfjs-dist": "^3.11.174",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.6"
  }
}
```

- [ ] **Step 2: Configure Vite, Tailwind, PostCSS, and index.html**

Create `frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
```

Create `frontend/postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Create `frontend/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#E5322D",
          hoverRed: "#C62828",
          darkRed: "#B71C1C",
          bgLight: "#F4F5F7",
          textDark: "#161616",
          textMuted: "#666666"
        }
      }
    },
  },
  plugins: [],
}
```

Create `frontend/index.html`:
```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SukaPDF - Alat PDF Online Gratis Identik iLovePDF</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#F4F5F7] text-[#161616] font-sans antialiased min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Create `frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

- [ ] **Step 3: Create Translation Locales and LanguageContext**

Create `frontend/src/locales/id.json`:
```json
{
  "nav": {
    "merge": "Gabungkan PDF",
    "split": "Pisahkan PDF",
    "compress": "Kompres PDF",
    "convert": "Konversi PDF",
    "all_tools": "Semua Alat PDF",
    "language": "Bahasa"
  },
  "hero": {
    "title": "Setiap alat yang Anda butuhkan untuk menggunakan PDF, ada di satu tempat",
    "subtitle": "Semua alat 100% GRATIS dan mudah digunakan! Gabung, pisahkan, kompres, konversi, putar, dan beri watermark pada PDF hanya dalam beberapa klik."
  },
  "dropzone": {
    "select_files": "Pilih file PDF",
    "drop_here": "atau jatuhkan PDF di sini",
    "select_images": "Pilih gambar JPG/PNG"
  },
  "buttons": {
    "process_now": "Proses Sekarang",
    "download": "Unduh File",
    "back_home": "Kembali ke Beranda",
    "process_another": "Proses Dokumen Lain"
  },
  "success": {
    "title": "File berhasil diproses!",
    "subtitle": "Dokumen Anda siap untuk diunduh."
  }
}
```

Create `frontend/src/locales/en.json`:
```json
{
  "nav": {
    "merge": "Merge PDF",
    "split": "Split PDF",
    "compress": "Compress PDF",
    "convert": "Convert PDF",
    "all_tools": "All PDF Tools",
    "language": "Language"
  },
  "hero": {
    "title": "Every tool you need to use PDFs, in one place",
    "subtitle": "All 100% FREE and easy to use! Merge, split, compress, convert, rotate, and watermark PDFs with just a few clicks."
  },
  "dropzone": {
    "select_files": "Select PDF files",
    "drop_here": "or drop PDFs here",
    "select_images": "Select JPG/PNG images"
  },
  "buttons": {
    "process_now": "Process Now",
    "download": "Download File",
    "back_home": "Back to Home",
    "process_another": "Process Another Document"
  },
  "success": {
    "title": "Files processed successfully!",
    "subtitle": "Your document is ready to download."
  }
}
```

Create `frontend/src/context/LanguageContext.jsx`:
```jsx
import React, { createContext, useContext, useState } from 'react';
import idLocale from '../locales/id.json';
import enLocale from '../locales/en.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('id');
  const translations = lang === 'id' ? idLocale : enLocale;

  const t = (path) => {
    const keys = path.split('.');
    let current = translations;
    for (const key of keys) {
      if (current[key] !== undefined) {
        current = current[key];
      } else {
        return path;
      }
    }
    return current;
  };

  const toggleLanguage = (newLang) => {
    setLang(newLang || (lang === 'id' ? 'en' : 'id'));
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
```

- [ ] **Step 4: Commit Task 5**

```bash
git add frontend/
git commit -m "feat(frontend): setup Vite, Tailwind CSS, and bilingual LanguageContext"
```

---

### Task 6: Tools Metadata, API Client, and Core UI Components (Navbar, Footer, Dropzone, PageGridPreview, ActionSidebar, ResultDownload, Toast)

**Files:**
- Create: `frontend/src/toolsConfig.js`
- Create: `frontend/src/services/api.js`
- Create: `frontend/src/components/Navbar.jsx`
- Create: `frontend/src/components/Footer.jsx`
- Create: `frontend/src/components/ToolCard.jsx`
- Create: `frontend/src/components/Dropzone.jsx`
- Create: `frontend/src/components/PageGridPreview.jsx`
- Create: `frontend/src/components/ActionSidebar.jsx`
- Create: `frontend/src/components/ResultDownload.jsx`
- Create: `frontend/src/components/Toast.jsx`

**Interfaces:**
- Consumes: `useLanguage()`, Axios, `lucide-react` icons
- Produces: Modular iLovePDF-styled React UI components

- [ ] **Step 1: Create `toolsConfig.js` and `api.js`**

Create `frontend/src/toolsConfig.js`:
```javascript
export const TOOLS = [
  {
    id: "merge",
    name: "Gabungkan PDF",
    nameEn: "Merge PDF",
    desc: "Gabungkan beberapa PDF menjadi satu dokumen dalam urutan yang Anda inginkan.",
    descEn: "Combine PDFs in the order you want with the easiest PDF merger available.",
    icon: "Layers",
    color: "#E5322D",
    category: "organize",
    endpoint: "/api/merge",
    multipleFiles: true,
    accept: ".pdf"
  },
  {
    id: "split",
    name: "Pisahkan PDF",
    nameEn: "Split PDF",
    desc: "Pisahkan satu halaman atau seluruh rangkaian untuk konversi mudah ke berkas PDF independen.",
    descEn: "Separate one page or a whole set for easy conversion into independent PDF files.",
    icon: "Scissors",
    color: "#FF7B00",
    category: "organize",
    endpoint: "/api/split",
    multipleFiles: false,
    accept: ".pdf"
  },
  {
    id: "compress",
    name: "Kompres PDF",
    nameEn: "Compress PDF",
    desc: "Kurangi ukuran berkas PDF Anda sambil mempertahankan kualitas terbaik.",
    descEn: "Reduce file size while optimizing for maximal PDF quality.",
    icon: "Minimize2",
    color: "#38B44A",
    category: "optimize",
    endpoint: "/api/compress",
    multipleFiles: false,
    accept: ".pdf"
  },
  {
    id: "pdf-to-word",
    name: "PDF ke Word",
    nameEn: "PDF to Word",
    desc: "Konversi dokumen PDF Anda menjadi berkas DOCX yang dapat diedit dengan mudah.",
    descEn: "Convert your PDF to WORD documents with incredible accuracy.",
    icon: "FileText",
    color: "#2072B8",
    category: "convert",
    endpoint: "/api/pdf-to-word",
    multipleFiles: false,
    accept: ".pdf"
  },
  {
    id: "pdf-to-excel",
    name: "PDF ke Excel",
    nameEn: "PDF to Excel",
    desc: "Ekstrak data tabel dari berkas PDF langsung ke lembar kerja Excel XLSX.",
    descEn: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.",
    icon: "FileSpreadsheet",
    color: "#107C41",
    category: "convert",
    endpoint: "/api/pdf-to-excel",
    multipleFiles: false,
    accept: ".pdf"
  },
  {
    id: "pdf-to-image",
    name: "PDF ke Gambar",
    nameEn: "PDF to JPG",
    desc: "Ekstrak semua gambar atau simpan setiap halaman PDF sebagai berkas JPG/PNG.",
    descEn: "Extract all images contained in a PDF or convert each page to JPG.",
    icon: "Image",
    color: "#7A288A",
    category: "convert",
    endpoint: "/api/pdf-to-image",
    multipleFiles: false,
    accept: ".pdf"
  },
  {
    id: "image-to-pdf",
    name: "Gambar ke PDF",
    nameEn: "JPG to PDF",
    desc: "Ubah foto JPG dan PNG menjadi berkas PDF dalam hitungan detik.",
    descEn: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
    icon: "FileImage",
    color: "#C2185B",
    category: "convert",
    endpoint: "/api/image-to-pdf",
    multipleFiles: true,
    accept: "image/*"
  },
  {
    id: "rotate",
    name: "Putar PDF",
    nameEn: "Rotate PDF",
    desc: "Putar halaman PDF sesuai sudut yang Anda inginkan.",
    descEn: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
    icon: "RotateCw",
    color: "#F7A600",
    category: "organize",
    endpoint: "/api/rotate",
    multipleFiles: false,
    accept: ".pdf"
  },
  {
    id: "watermark",
    name: "Cap Air (Watermark)",
    nameEn: "Watermark PDF",
    desc: "Tambahkan teks cap air di atas PDF Anda dengan transparansi yang sesuai.",
    descEn: "Stamp an image or text over your PDF in seconds. Choose position and opacity.",
    icon: "Stamp",
    color: "#E040FB",
    category: "edit",
    endpoint: "/api/watermark",
    multipleFiles: false,
    accept: ".pdf"
  },
  {
    id: "protect",
    name: "Kunci PDF",
    nameEn: "Protect PDF",
    desc: "Enkripsi berkas PDF Anda dengan kata sandi untuk mencegah akses tidak sah.",
    descEn: "Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.",
    icon: "Lock",
    color: "#D32F2F",
    category: "security",
    endpoint: "/api/protect",
    multipleFiles: false,
    accept: ".pdf"
  },
  {
    id: "unlock",
    name: "Buka Sandi PDF",
    nameEn: "Unlock PDF",
    desc: "Hapus proteksi kata sandi dari PDF Anda.",
    descEn: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
    icon: "Unlock",
    color: "#009688",
    category: "security",
    endpoint: "/api/unlock",
    multipleFiles: false,
    accept: ".pdf"
  },
  {
    id: "ocr",
    name: "PDF OCR",
    nameEn: "OCR PDF",
    desc: "Pindai teks pada PDF hasil scan sehingga teks dapat disalin dan dicari.",
    descEn: "Convert scanned PDF to searchable and selectable document easily.",
    icon: "Eye",
    color: "#3F51B5",
    category: "edit",
    endpoint: "/api/ocr",
    multipleFiles: false,
    accept: ".pdf"
  }
];
```

Create `frontend/src/services/api.js`:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const processPdfTool = async (endpoint, formData) => {
  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  });
  return response.data;
};

export default api;
```

- [ ] **Step 2: Implement Navbar, Footer, and ToolCard components**

Create `frontend/src/components/Navbar.jsx`:
```jsx
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TOOLS } from '../toolsConfig';
import { Heart, Globe, ChevronDown, Menu, X } from 'lucide-react';

export const Navbar = ({ onSelectTool, onGoHome }) => {
  const { lang, toggleLanguage, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={onGoHome} 
          className="flex items-center space-x-1.5 cursor-pointer select-none"
        >
          <span className="text-2xl font-black tracking-tight text-gray-900">Suka</span>
          <div className="bg-[#E5322D] text-white p-1 rounded-md flex items-center justify-center">
            <Heart size={18} fill="currentColor" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#E5322D]">PDF</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-gray-700">
          <button onClick={() => onSelectTool('merge')} className="hover:text-[#E5322D] transition-colors">
            {t('nav.merge')}
          </button>
          <button onClick={() => onSelectTool('split')} className="hover:text-[#E5322D] transition-colors">
            {t('nav.split')}
          </button>
          <button onClick={() => onSelectTool('compress')} className="hover:text-[#E5322D] transition-colors">
            {t('nav.compress')}
          </button>

          {/* All Tools Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1 hover:text-[#E5322D] transition-colors py-2"
            >
              <span>{t('nav.all_tools')}</span>
              <ChevronDown size={14} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 w-80 bg-white border border-gray-200 shadow-xl rounded-xl p-3 grid grid-cols-1 gap-1.5 z-50">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool.id);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 text-left text-xs font-medium text-gray-800 transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tool.color }}></span>
                    <span>{lang === 'id' ? tool.name : tool.nameEn}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Language Switcher */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => toggleLanguage()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Globe size={14} />
            <span>{lang.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
```

Create `frontend/src/components/Footer.jsx`:
```jsx
import React from 'react';
import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 text-center text-xs text-gray-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-1 font-semibold text-gray-700">
          <span>© 2026 SukaPDF. Dibuat dengan</span>
          <Heart size={14} className="text-[#E5322D] fill-current" />
          <span>untuk kemudahan pengolahan PDF Anda.</span>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:underline">Privasi</a>
          <a href="#" className="hover:underline">Syarat & Ketentuan</a>
          <a href="#" className="hover:underline">Kontak</a>
        </div>
      </div>
    </footer>
  );
};
```

Create `frontend/src/components/ToolCard.jsx`:
```jsx
import React from 'react';
import * as Icons from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ToolCard = ({ tool, onClick }) => {
  const { lang } = useLanguage();
  const IconComponent = Icons[tool.icon] || Icons.FileText;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
        >
          <IconComponent size={26} />
        </div>
        <h3 className="text-lg font-extrabold text-gray-900 mb-2 group-hover:text-[#E5322D] transition-colors">
          {lang === 'id' ? tool.name : tool.nameEn}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          {lang === 'id' ? tool.desc : tool.descEn}
        </p>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Implement Dropzone, PageGridPreview, ActionSidebar, ResultDownload, and Toast**

Create `frontend/src/components/Dropzone.jsx`:
```jsx
import React, { useRef } from 'react';
import { Upload, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Dropzone = ({ tool, onFilesSelected }) => {
  const { t, lang } = useLanguage();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="max-w-3xl mx-auto my-12 bg-white border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center shadow-lg hover:border-[#E5322D] transition-colors cursor-pointer"
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={tool.multipleFiles}
        accept={tool.accept}
        className="hidden"
      />
      <div className="w-20 h-20 bg-red-50 text-[#E5322D] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <Upload size={36} />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">
        {lang === 'id' ? tool.name : tool.nameEn}
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        {lang === 'id' ? tool.desc : tool.descEn}
      </p>

      <button className="bg-[#E5322D] hover:bg-[#C62828] active:scale-95 text-white text-lg font-extrabold px-8 py-4 rounded-2xl shadow-xl transition-all inline-flex items-center space-x-3">
        <Plus size={24} />
        <span>{t('dropzone.select_files')}</span>
      </button>
      
      <p className="text-xs text-gray-400 mt-4 font-medium">
        {t('dropzone.drop_here')}
      </p>
    </div>
  );
};
```

Create `frontend/src/components/PageGridPreview.jsx`:
```jsx
import React from 'react';
import { RotateCw, Trash2, File } from 'lucide-react';

export const PageGridPreview = ({ files, onRotate, onDelete }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6">
      {files.map((fileObj, idx) => (
        <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-md p-4 relative group flex flex-col items-center">
          <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden border">
            <File size={48} className="text-gray-400" />
            <span className="absolute bottom-2 right-2 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              #{idx + 1}
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-800 truncate w-full text-center">
            {fileObj.name || `File ${idx + 1}`}
          </p>

          {/* Action overlay */}
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onRotate && (
              <button 
                onClick={() => onRotate(idx)}
                className="bg-white p-1.5 rounded-full shadow border hover:bg-gray-100 text-gray-700"
              >
                <RotateCw size={14} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(idx)}
                className="bg-red-50 p-1.5 rounded-full shadow border border-red-200 text-[#E5322D] hover:bg-red-100"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

Create `frontend/src/components/ActionSidebar.jsx`:
```jsx
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Settings } from 'lucide-react';

export const ActionSidebar = ({ tool, options, onOptionsChange, onProcess, isProcessing }) => {
  const { t, lang } = useLanguage();

  return (
    <div className="w-full md:w-80 bg-white border-l border-gray-200 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 text-gray-900 font-extrabold text-lg border-b pb-4 mb-6">
          <Settings size={20} className="text-[#E5322D]" />
          <span>Pengaturan {lang === 'id' ? tool.name : tool.nameEn}</span>
        </div>

        {/* Dynamic Tool Settings */}
        {tool.id === 'watermark' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700">Teks Cap Air</label>
            <input
              type="text"
              value={options.watermarkText || 'SukaPDF'}
              onChange={(e) => onOptionsChange({ ...options, watermarkText: e.target.value })}
              className="w-full border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#E5322D] outline-none"
            />
          </div>
        )}

        {tool.id === 'protect' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700">Kata Sandi Baru</label>
            <input
              type="password"
              value={options.password || ''}
              onChange={(e) => onOptionsChange({ ...options, password: e.target.value })}
              className="w-full border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#E5322D] outline-none"
              placeholder="Masukkan password..."
            />
          </div>
        )}

        {tool.id === 'unlock' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700">Kata Sandi Buka PDF</label>
            <input
              type="password"
              value={options.password || ''}
              onChange={(e) => onOptionsChange({ ...options, password: e.target.value })}
              className="w-full border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#E5322D] outline-none"
              placeholder="Masukkan password..."
            />
          </div>
        )}

        {tool.id === 'split' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700">Rentang Halaman (opsional, misal: 1-3, 5)</label>
            <input
              type="text"
              value={options.ranges || ''}
              onChange={(e) => onOptionsChange({ ...options, ranges: e.target.value })}
              className="w-full border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#E5322D] outline-none"
              placeholder="1-5, 8"
            />
          </div>
        )}
      </div>

      <button
        onClick={onProcess}
        disabled={isProcessing}
        className="w-full mt-6 bg-[#E5322D] hover:bg-[#C62828] active:scale-95 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        <span>{isProcessing ? 'Memproses...' : t('buttons.process_now')}</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};
```

Create `frontend/src/components/ResultDownload.jsx`:
```jsx
import React from 'react';
import { CheckCircle2, Download, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ResultDownload = ({ downloadUrl, fileName, onGoHome, onReset }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto my-16 bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-xl">
      <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-2">
        {t('success.title')}
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        {t('success.subtitle')}
      </p>

      <a
        href={downloadUrl}
        download={fileName || 'sukapdf_output.pdf'}
        className="bg-[#E5322D] hover:bg-[#C62828] active:scale-95 text-white text-xl font-black px-10 py-5 rounded-2xl shadow-2xl transition-all inline-flex items-center space-x-3 mb-8"
      >
        <Download size={28} />
        <span>{t('buttons.download')}</span>
      </a>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-gray-100">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-sm font-bold text-gray-700 hover:text-[#E5322D]"
        >
          <RefreshCw size={16} />
          <span>{t('buttons.process_another')}</span>
        </button>
        <button
          onClick={onGoHome}
          className="flex items-center space-x-2 text-sm font-bold text-gray-700 hover:text-[#E5322D]"
        >
          <ArrowLeft size={16} />
          <span>{t('buttons.back_home')}</span>
        </button>
      </div>
    </div>
  );
};
```

Create `frontend/src/components/Toast.jsx`:
```jsx
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const Toast = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-bounce">
      <AlertCircle size={20} />
      <span className="text-sm font-bold">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-red-700 rounded-lg">
        <X size={16} />
      </button>
    </div>
  );
};
```

- [ ] **Step 4: Commit Task 6**

```bash
git add frontend/
git commit -m "feat(frontend): create tools metadata, API client, and modular UI components"
```

---

### Task 7: Frontend Page Routing Assembly & Tool Workspace

**Files:**
- Create: `frontend/src/pages/HomePage.jsx`
- Create: `frontend/src/pages/ToolWorkspace.jsx`
- Modify: `frontend/src/App.jsx`
- Create: `frontend/src/main.jsx`

**Interfaces:**
- Consumes: All UI components, `LanguageProvider`, `processPdfTool` API client
- Produces: Complete interactive web interface matching iLovePDF workflow

- [ ] **Step 1: Create `HomePage.jsx`**

Create `frontend/src/pages/HomePage.jsx`:
```jsx
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TOOLS } from '../toolsConfig';
import { ToolCard } from '../components/ToolCard';

export const HomePage = ({ onSelectTool }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
          {t('hero.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-500 font-medium">
          {t('hero.subtitle')}
        </p>
      </div>

      {/* Grid Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onClick={() => onSelectTool(tool.id)} />
        ))}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Create `ToolWorkspace.jsx`**

Create `frontend/src/pages/ToolWorkspace.jsx`:
```jsx
import React, { useState } from 'react';
import { TOOLS } from '../toolsConfig';
import { Dropzone } from '../components/Dropzone';
import { PageGridPreview } from '../components/PageGridPreview';
import { ActionSidebar } from '../components/ActionSidebar';
import { ResultDownload } from '../components/ResultDownload';
import { Toast } from '../components/Toast';
import { processPdfTool } from '../services/api';

export const ToolWorkspace = ({ toolId, onGoHome }) => {
  const tool = TOOLS.find((t) => t.id === toolId) || TOOLS[0];
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [options, setOptions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const handleProcess = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage("Silakan pilih file terlebih dahulu.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const formData = new FormData();
    if (tool.multipleFiles) {
      selectedFiles.forEach((file) => formData.append('files', file));
    } else {
      formData.append('file', selectedFiles[0]);
    }

    if (options.watermarkText) formData.append('text', options.watermarkText);
    if (options.password) formData.append('password', options.password);
    if (options.ranges) formData.append('ranges', options.ranges);

    try {
      const blob = await processPdfTool(tool.endpoint, formData);
      const url = window.URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Gagal memproses dokumen. Periksa kembali file Anda.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (resultUrl) {
    return (
      <ResultDownload
        downloadUrl={resultUrl}
        fileName={`sukapdf_${tool.id}.pdf`}
        onGoHome={onGoHome}
        onReset={() => {
          setSelectedFiles([]);
          setResultUrl(null);
        }}
      />
    );
  }

  if (selectedFiles.length === 0) {
    return (
      <>
        <Dropzone tool={tool} onFilesSelected={handleFilesSelected} />
        <Toast message={errorMessage} onClose={() => setErrorMessage(null)} />
      </>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <div className="flex-1 bg-[#F4F5F7]">
        <PageGridPreview
          files={selectedFiles}
          onRotate={() => {}}
          onDelete={(idx) => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
        />
      </div>
      <ActionSidebar
        tool={tool}
        options={options}
        onOptionsChange={setOptions}
        onProcess={handleProcess}
        isProcessing={isProcessing}
      />
      <Toast message={errorMessage} onClose={() => setErrorMessage(null)} />
    </div>
  );
};
```

- [ ] **Step 3: Modify `App.jsx` & create `main.jsx`**

Create `frontend/src/App.jsx`:
```jsx
import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ToolWorkspace } from './pages/ToolWorkspace';

export default function App() {
  const [activeToolId, setActiveToolId] = useState(null);

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col justify-between bg-[#F4F5F7]">
        <div>
          <Navbar
            onSelectTool={(id) => setActiveToolId(id)}
            onGoHome={() => setActiveToolId(null)}
          />
          <main>
            {activeToolId ? (
              <ToolWorkspace
                toolId={activeToolId}
                onGoHome={() => setActiveToolId(null)}
              />
            ) : (
              <HomePage onSelectTool={(id) => setActiveToolId(id)} />
            )}
          </main>
        </div>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
```

Create `frontend/src/main.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Build verification test**

Run: `cd frontend && npm install && npm run build`  
Expected: Build passes with no JSX/bundling errors.

- [ ] **Step 5: Commit Task 7**

```bash
git add frontend/
git commit -m "feat(frontend): assemble page routing, tool workspace, and app entrypoints"
```

---

### Task 8: End-to-End System Verification and Launch Check

**Files:**
- Test: `backend/tests/test_api_integration.py`
- Executable: `backend/run.py`

- [ ] **Step 1: Run complete backend pytest suite**

Run: `pytest backend/tests/ -v`  
Expected: All unit and integration tests PASS.

- [ ] **Step 2: Run frontend build check**

Run: `npm run build` in `frontend/` directory  
Expected: Zero compilation or linting errors.

- [ ] **Step 3: Launch dev services verification**

Launch backend on port 8000 and frontend on port 5173. Verify root endpoint `http://localhost:8000/` and Vite server load without errors.

- [ ] **Step 4: Commit Task 8**

```bash
git commit --allow-empty -m "chore: complete end-to-end implementation and verification of SukaPDF"
```
