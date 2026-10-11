# SukaPDF (KlikPDF) - Product Requirements Document

## Overview
SukaPDF adalah aplikasi web dan mobile untuk manipulasi dokumen PDF dengan fitur konversi, OCR, merge/split, dan editing gambar.

## Target Users
- Pengguna umum yang membutuhkan tools PDF gratis
- Profesional yang perlu mengolah dokumen secara cepat
- Pengguna mobile yang butuh akses PDF tools on-the-go

## Core Features

### 1. PDF Conversion
- PDF to Word (DOCX)
- PDF to Excel (XLSX)
- PDF to Image (PNG/JPG)
- Word/Excel/Image to PDF

### 2. PDF Manipulation
- Merge multiple PDFs
- Split PDF by pages
- Compress PDF size
- Rotate & reorder pages

### 3. OCR (Optical Character Recognition)
- Extract text from scanned PDF
- Support multi-language (ID, EN)
- Output to editable text/PDF

### 4. Image Tools
- Image to PDF converter
- Batch image processing
- Image compression in PDF

## Technical Requirements

### Frontend
- React 18 + Vite
- TailwindCSS for styling
- Capacitor for mobile (Android/iOS)
- Google OAuth authentication
- Multi-language support (ID/EN)
- Dark/Light theme
- PWA-ready

### Backend
- FastAPI (Python)
- PyMuPDF + pdf2docx for conversion
- Tesseract OCR
- Temporary file storage with auto-cleanup
- CORS configured for production domains

### Security
- File upload max 50MB
- Max 200 pages per PDF
- Auto-cleanup temp files (30 min)
- CSP headers configured
- No persistent user data storage

## Deployment
- Frontend: Vercel
- Backend: Heroku/Render
- Mobile: Play Store / App Store (via Capacitor)

## Non-Functional Requirements
- Response time < 3s for conversions
- Support concurrent users
- Mobile-responsive UI
- Accessibility compliant
- Zero-knowledge privacy (files deleted after processing)

## Future Enhancements
- PDF annotation/editor
- Cloud storage integration (Google Drive)
- Batch processing queue
- User accounts with history
- API key for developers

</content>