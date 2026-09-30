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
            for page_num in range(total_pages):
                new_doc = fitz.open()
                new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
                out_file = output_dir / f"page_{page_num + 1}.pdf"
                new_doc.save(out_file)
                new_doc.close()
                output_files.append(out_file)
        else:
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
    def add_watermark(pdf_path: Path, output_path: Path, text: str = "KlikPDF", opacity: float = 0.3) -> Path:
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
