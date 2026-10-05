---
name: pdf-engine-specialist
description: Specialist in Client-Side & Backend PDF algorithms, OCR, compression, encryption, conversion, and WebAssembly rendering for KlikPDF. Use when implementing or debugging PDF tools, manipulating PDF streams, optimizing clientPdfProcessor, or extracting structured data from documents.
---

# PDF Engine Specialist

Specialist guidance and best practices for developing, optimizing, and debugging PDF processing engines in KlikPDF (both Client-Side Web/Wasm and Python Backend).

## 1. Client-Side Engine Architecture (`clientPdfProcessor.js`)

Always prioritize zero-latency client-side execution using standard web libraries:
* **`pdf-lib`**: For PDF manipulation (Merge, Split, Rotate, Watermark, Form Filling, Metadata).
  - Use `ignoreEncryption: true` when loading user PDFs to avoid unexpected failures on read-only permissions.
  - Clean up ArrayBuffer and Blob objects after use to prevent browser memory leaks.
* **`jsPDF`**: For generating PDFs from scratch, HTML canvas, or text (e.g., Word-to-PDF, Image-to-PDF).
* **`mammoth`**: For client-side `.docx` parsing and conversion into clean structured HTML/text before passing into `jsPDF`.
* **HTML5 Canvas**: For HD Image Upscaling (unsharp mask filter + contrast boost) and image rasterization.

## 2. Best Practices for PDF Algorithms

### A. Memory Management
* When dealing with large PDF files (>50MB) in browser RAM:
  - Process pages in chunks / streaming slices rather than loading all pages at once.
  - Revoke temporary Object URLs using `URL.revokeObjectURL(url)` when switching tools or after download.

### B. Font Embedding
* Standard fonts: Use `StandardFonts.Helvetica`, `StandardFonts.HelveticaBold`, or `StandardFonts.TimesRoman` to avoid increasing the PDF byte size.
* Custom Unicode: Embed TrueType subset fonts only when supporting special character sets or signatures.

### C. Client-Side OCR (Roadmap)
* Use `tesseract.js` with WebWorker thread isolation to prevent freezing the React UI thread during recognition.
* Pre-process images with high-pass thresholding and grayscale conversion on `<canvas>` before OCR inference.

## 3. Backend Fallback Engine (`backend/services/pdf_service.py`)

* Use **PyMuPDF (`fitz`)** for high-speed server rasterization, vector rendering, and page extraction.
* Use **`pdf2docx`** for advanced layout-retaining PDF to Word conversions.
* Ensure immediate temporary file cleanup in `finally` blocks to guarantee user privacy.
