# Design Specification: SukaPDF (iLovePDF Clone)

**Date**: 2026-09-30  
**Target Location**: `C:\experiment bro\SukaPDF`  
**Application Name**: SukaPDF (Replika iLovePDF)  

---

## 1. Project Overview

SukaPDF adalah aplikasi web pengolah dokumen dan PDF yang dirancang dengan antarmuka visual, tema warna, dan alur kerja yang persis seperti **iLovePDF.com**. Aplikasi ini bersifat *free-tier open tool* (tanpa wajib login), memungkinkan pengguna langsung mengunggah file, mengatur opsi, memproses dokumen, dan mengunduh hasilnya secara instan.

### Nilai Utama:
- **Visual & UX Identik**: Skema warna khas iLovePDF (merah `#E5322D`, abu-abu lembut `#F4F5F7`, putih `#FFFFFF`), kartu alat warna-warni, dropzone merah besar, preview thumbnail halaman interaktif.
- **Bilingual (ID / EN)**: Default Bahasa Indonesia dengan toggle langsung ke Bahasa Inggris.
- **Dukungan Operasi Lengkap**:
  - Manipulasi PDF Inti: Gabungkan (Merge), Pisahkan (Split), Kompres (Compress), Putar (Rotate), Atur Halaman (Organize), Hapus Halaman, Beri Nomor Halaman, Cap Air (Watermark), Kunci Sandi (Protect), Buka Sandi (Unlock).
  - Konversi Dokumen: PDF ke Word (`.docx`), Word ke PDF, PDF ke Excel (`.xlsx`), Excel ke PDF, PDF ke Gambar (JPG/PNG), Gambar ke PDF.
  - OCR: Pengenalan teks otomatis pada dokumen PDF pindaian.

---

## 2. System Architecture

Aplikasi menggunakan arsitektur decoupled client-server:

```
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (Port 5173)                    │
│             React + Vite + Tailwind CSS                 │
│  - Halaman Beranda (Hero, Grid Alat, Navigasi)          │
│  - Workspace Alat Interaktif (Dropzone, Grid Preview)   │
│  - PDF Rendering & Page Canvas (pdfjs-dist)             │
│  - Bilingual Context Provider (id.json & en.json)       │
│  - REST API Client                                      │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP Multipart Form Data
┌────────────────────────────▼────────────────────────────┐
│                 BACKEND (Port 8000)                     │
│                Python 3.12 + FastAPI                    │
│  - Router Inti: /api/merge, /api/split, /api/compress   │
│  - Router Konversi: /api/pdf-to-word, /api/word-to-pdf  │
│  - Router Tabular: /api/pdf-to-excel, /api/excel-to-pdf │
│  - Router Gambar & OCR: /api/pdf-to-image, /api/ocr     │
│  - Engine: PyMuPDF (fitz), pdf2docx, openpyxl, PIL     │
│  - Temporary Session Storage & Auto-Cleanup Worker     │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```text
C:\experiment bro\SukaPDF\
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes_core.py       # Merge, split, compress, rotate, watermark, protect, unlock
│   │   │   ├── routes_convert.py    # PDF <-> Word, PDF <-> Excel
│   │   │   ├── routes_image.py      # PDF <-> JPG/PNG
│   │   │   └── routes_ocr.py        # OCR scanning
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── pdf_service.py       # FitZ (PyMuPDF) & pypdf logic
│   │   │   ├── convert_service.py   # pdf2docx, docx, openpyxl logic
│   │   │   └── ocr_service.py       # Tesseract OCR & image fallback logic
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # App settings (upload limits, CORS, paths)
│   │   │   └── storage.py           # UUID directory manager & cleanup routines
│   │   └── main.py                  # FastAPI initialization & middleware
│   ├── requirements.txt
│   └── run.py                       # Entry point untuk menjalankan uvicorn
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                  # Logo, ikon ilustrasi
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Header khas iLovePDF + dropdown navigasi & toggle ID/EN
│   │   │   ├── Footer.jsx           # Footer komprehensif
│   │   │   ├── ToolCard.jsx         # Kartu alat pada beranda dengan warna aksen
│   │   │   ├── Dropzone.jsx         # Upload box merah melengkung dengan tombol besar
│   │   │   ├── PageGridPreview.jsx  # Grid thumbnail halaman PDF dengan tombol rotasi & hapus
│   │   │   ├── ActionSidebar.jsx    # Panel pengaturan kanan & tombol eksekusi merah
│   │   │   ├── ResultDownload.jsx   # Layar sukses & tombol download instan
│   │   │   └── Toast.jsx            # Notifikasi error / sukses
│   │   ├── context/
│   │   │   └── LanguageContext.jsx  # Penyedia status bahasa (ID/EN)
│   │   ├── locales/
│   │   │   ├── id.json              # Terjemahan Bahasa Indonesia
│   │   │   └── en.json              # Terjemahan Bahasa Inggris
│   │   ├── services/
│   │   │   └── api.js               # Klien Axios dengan base URL port 8000
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Katalog lengkap alat & deskripsi
│   │   │   └── ToolWorkspace.jsx    # Halaman kerja alat dinamis
│   │   ├── toolsConfig.js           # Konfigurasi metadata seluruh alat (rute, ikon, endpoint)
│   │   ├── App.jsx                  # Router aplikasi
│   │   ├── index.css                # Tailwind CSS directives & kustom styling
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-09-30-sukapdf-design.md
└── README.md
```

---

## 4. Frontend Specifications

### 4.1. Visual Style & Theme
- **Warna Identitas**:
  - Primary Red: `#E5322D` (Hover: `#C62828`, Active: `#B71C1C`)
  - Background Neutral: `#FFFFFF` dan `#F4F5F7`
  - Text Primary: `#161616`, Text Secondary: `#666666`, Border: `#E0E0E0`
  - Kategori Warna Kartu:
    - Merge: Merah `#E5322D`
    - Split: Oranye `#FF7B00`
    - Compress: Hijau `#38B44A`
    - PDF to Word: Biru Tua `#2072B8`
    - PDF to Excel: Hijau Excel `#107C41`
    - PDF to Image: Ungu `#7A288A`
    - Protect/Unlock: Kuning/Emas `#F7A600`
- **Tipografi**: Inter / Segoe UI, sans-serif, bersih dan modern.

### 4.2. Alur Kerja Pengguna (User Flow)
1. **Beranda**:
   - Navbar dengan logo teks "SukaPDF" (bergaya iLovePDF dengan aksen hati merah).
   - Menu dropdown untuk navigasi cepat antar kategori alat.
   - Switcher bahasa (ID / EN) di sudut kanan atas.
   - Hero banner: judul tebal, deskripsi singkat.
   - Grid kartu alat responsif (hover effect naik 2px dengan bayangan lembut).
2. **Halaman Alat (Workspace)**:
   - **Tahap Upload**: Area dropzone besar berwarna putih dengan tombol melengkung merah *"Pilih file PDF"* atau drag & drop langsung.
   - **Tahap Pengaturan/Staging**:
     - File/halaman ditampilkan dalam kartu grid dengan thumbnail visual (dirender via `pdfjs-dist`).
     - Setiap kartu memiliki tombol: Putar 90° (rotasi visual), Hapus halaman.
     - Tombol melayang di samping: Tambah file tambahan (untuk Merge / Image to PDF).
     - Sidebar kanan: Opsi spesifik alat (misal: rasio kompresi, input password, teks watermark, dll.).
     - Tombol merah besar di kanan bawah: *"Proses Sekarang ➔"*.
   - **Tahap Selesai**:
     - Tampilan centang hijau sukses: *"File berhasil diproses!"*.
     - Tombol unduh merah besar: *"Unduh File"*.
     - File otomatis terunduh di browser.
     - Tombol *"Kembali ke Beranda"* dan *"Proses Dokumen Lain"*.

---

## 5. Backend Specifications

### 5.1. Teknologi & Pustaka Utama
- **FastAPI**: Framework REST API performa tinggi berbasis asinkron.
- **PyMuPDF (`fitz`)**: Manipulasi PDF ultra-cepat untuk merge, split, rotate, extract image, watermark injection, dan enkripsi.
- **`pypdf`**: Manajemen enkripsi/dekripsi dan validasi struktur PDF.
- **`pdf2docx`**: Konversi akurat PDF ke dokumen Word `.docx`.
- **`python-docx`**: Rekonstruksi dan pembacaan berkas Word.
- **`openpyxl` & `pdfplumber`**: Ekstraksi tabel data dari PDF ke lembar kerja Excel `.xlsx`.
- **`Pillow`**: Manipulasi dan kompresi gambar JPG/PNG.
- **`pytesseract`**: Ekstraksi teks OCR dari halaman pindaian.

### 5.2. Endpoint API
Semua endpoint beroperasi di path prefix `/api`:

| Method | Path | Parameter Input | Return | Deskripsi |
|---|---|---|---|---|
| `POST` | `/api/merge` | `files: List[UploadFile]`, `order: str` | File PDF | Menggabungkan multiple PDF sesuai urutan |
| `POST` | `/api/split` | `file: UploadFile`, `ranges: str`, `mode: str` | File PDF atau ZIP | Memecah halaman PDF atau ekstrak halaman |
| `POST` | `/api/compress` | `file: UploadFile`, `level: str` | File PDF | Kompresi stream PDF & gambar internal |
| `POST` | `/api/rotate` | `file: UploadFile`, `rotations: str` | File PDF | Memutar halaman PDF sesuai derajat sudut |
| `POST` | `/api/watermark` | `file: UploadFile`, `text: str`, `opacity: float`, `position: str` | File PDF | Memberikan cap air teks |
| `POST` | `/api/page-numbers` | `file: UploadFile`, `position: str`, `format: str` | File PDF | Menambahkan penomoran halaman otomatis |
| `POST` | `/api/protect` | `file: UploadFile`, `password: str` | File PDF | Enkripsi dokumen dengan kata sandi |
| `POST` | `/api/unlock` | `file: UploadFile`, `password: str` | File PDF | Membuka proteksi kata sandi |
| `POST` | `/api/pdf-to-word` | `file: UploadFile` | File `.docx` | Konversi PDF menjadi Word editable |
| `POST` | `/api/word-to-pdf` | `file: UploadFile` | File PDF | Konversi Word menjadi PDF |
| `POST` | `/api/pdf-to-excel` | `file: UploadFile` | File `.xlsx` | Ekstraksi tabel menjadi dokumen Excel |
| `POST` | `/api/excel-to-pdf` | `file: UploadFile` | File PDF | Konversi lembar kerja Excel menjadi PDF |
| `POST` | `/api/pdf-to-image` | `file: UploadFile`, `format: str` | File ZIP (JPG/PNG) | Mengekstrak setiap halaman jadi gambar |
| `POST` | `/api/image-to-pdf` | `files: List[UploadFile]`, `fit: str` | File PDF | Menggabungkan foto/gambar menjadi satu PDF |
| `POST` | `/api/ocr` | `file: UploadFile`, `lang: str` | File PDF | OCR teks pada dokumen hasil scan |

### 5.3. Manajemen File Sementara & Pembersihan (Auto-Cleanup)
- Setiap transaksi unggahan membuat direktori sementara di:  
  `backend/temp_storage/<uuid4>/`
- Output file dihasilkan di direktori yang sama dan dikirim ke klien menggunakan `FileResponse(background=...)`.
- Background task menghapus direktori transaksi segera setelah pengiriman respon tuntas, atau melalui timer penghapus file kadaluwarsa (> 30 menit).

---

## 6. Error Handling & Edge Cases

1. **File Rusak / Invalid Mime-Type**:
   - Backend memverifikasi header magic bytes file (`%PDF-` untuk PDF). Jika tidak valid, mengembalikan status HTTP 400 dengan pesan JSON deskriptif.
2. **File Terkunci Kata Sandi**:
   - Operasi yang memerlukan pembacaan stream akan mendeteksi apakah file terenkripsi. Jika iya, sistem mengembalikan notifikasi agar pengguna membuka kunci dokumen terlebih dahulu.
3. **Dokumen Tanpa Tabel (PDF to Excel)**:
   - Jika `pdfplumber` tidak mendeteksi garis tabel, backend melakukan fallback ekstraksi berbasis teks baris-ke-kolom sehingga tidak terjadi kegagalan proses.
4. **Respon Jaringan di Frontend**:
   - Setiap pemanggilan API dibungkus oleh penangan error dengan banner toast merah yang ramah, menjelaskan permasalahan secara jelas.

---

## 7. Verification & Testing Strategy

1. **Uji Fungsional Backend**:
   - Skrip tes verifikasi otomatis (`test_api.py`) yang membuat file PDF dan gambar sintetis, kemudian memanggil setiap endpoint untuk memverifikasi output file yang valid.
2. **Uji Build Frontend**:
   - Eksekusi `npm run build` untuk memastikan tidak ada kesalahan kompilasi JSX, dependensi hilang, atau syntax error.
3. **Uji Integrasi End-to-End**:
   - Menjalankan FastAPI di port 8000 dan Vite dev server di port 5173.
   - Melakukan pengujian alur langsung pada browser:
     - Navigasi dan penggantian bahasa ID/EN.
     - Upload file pada fitur Merge PDF.
     - Reordering halaman dan rotasi.
     - Eksekusi pemrosesan dan download hasil.
