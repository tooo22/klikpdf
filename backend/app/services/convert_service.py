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
        ws.title = "KlikPDF Data"
        
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
                    text = page.extract_text() or ""
                    for line in text.split("\n"):
                        ws.cell(row=row_idx, column=1, value=line)
                        row_idx += 1
        wb.save(xlsx_output_path)
        return xlsx_output_path

    @staticmethod
    def word_to_pdf(docx_path: Path, pdf_output_path: Path) -> Path:
        # 1. Try Windows Word COM conversion via docx2pdf
        try:
            from docx2pdf import convert
            import pythoncom
            pythoncom.CoInitialize()
            convert(str(docx_path), str(pdf_output_path))
            if pdf_output_path.exists() and pdf_output_path.stat().st_size > 0:
                return pdf_output_path
        except Exception:
            pass

        # 2. Fallback: python-docx + ReportLab high-fidelity builder
        try:
            from docx import Document
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors

            doc = Document(str(docx_path))
            pdf_doc = SimpleDocTemplate(str(pdf_output_path), pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
            styles = getSampleStyleSheet()
            
            body_style = ParagraphStyle(
                'DocxBody',
                parent=styles['Normal'],
                fontSize=11,
                leading=15,
                textColor=colors.HexColor("#1e293b")
            )
            
            story = []

            for p in doc.paragraphs:
                text = p.text.strip()
                if text:
                    story.append(Paragraph(text, body_style))
                    story.append(Spacer(1, 8))

            for table in doc.tables:
                data = []
                for row in table.rows:
                    row_data = [cell.text.strip() for cell in row.cells]
                    data.append(row_data)
                if data:
                    t = Table(data)
                    t.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
                        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
                        ('FONTSIZE', (0,0), (-1,-1), 9),
                        ('TOPPADDING', (0,0), (-1,-1), 5),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                    ]))
                    story.append(t)
                    story.append(Spacer(1, 12))

            if not story:
                story.append(Paragraph("Dokumen Word tidak memiliki teks.", body_style))

            pdf_doc.build(story)
            return pdf_output_path
        except Exception as e:
            raise Exception(f"Gagal mengonversi Word ke PDF: {str(e)}")

convert_service = ConvertService()
